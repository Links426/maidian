import axios from "axios";
import fs from "fs";

const replaceAop = (
  source: { [x: string]: any } | undefined,
  name: string,
  fn: (arg0: any) => any
): void => {
  if (source === undefined) return;
  if (name in source) {
    const original = source[name];
    const wrapped = fn(original);
    if (typeof wrapped === "function") {
      source[name] = wrapped;
    }
  }
};

interface XhrData {
  method: string;
  url: string;
  startTime: number;
  type: string;
  reqData?: any;
  status?: number;
  responseText?: string;
  elapsedTime?: number;
}

declare global {
  interface XMLHttpRequest {
    _xhr: XhrData;
  }
}

const xhrReplace = (reportUrl: string): void => {
  let a = true;
  if (!("XMLHttpRequest" in window)) {
    return;
  }
  const originalXhrProto = XMLHttpRequest.prototype;

  replaceAop(originalXhrProto, "open", function (originalOpen: Function) {
    return function (this: XMLHttpRequest, ...args: any[]) {
      this._xhr = {
        method: typeof args[0] === "string" ? args[0].toUpperCase() : args[0],
        url: args[1],
        startTime: new Date().getTime(),
        type: "xhr",
      };
      originalOpen.apply(this, args);
    };
  });

  replaceAop(originalXhrProto, "send", function (originalSend: Function) {
    return function (this: XMLHttpRequest, ...args: any[]) {
      this.addEventListener("loadend", () => {
        const { responseType, response, status } = this;
        const endTime = new Date().getTime();
        this._xhr.reqData = args[0];
        this._xhr.status = status;
        if (["", "json", "text"].indexOf(responseType) !== -1) {
          this._xhr.responseText =
            typeof response === "object" ? JSON.stringify(response) : response;
        }
        this._xhr.elapsedTime = endTime - this._xhr.startTime;

        if (a) {
          axios.post(reportUrl, this._xhr).then(({ data }) => {
            console.log(data);
          });
        }
        a = false;
      });
      a = true;
      originalSend.apply(this, args);
    };
  });
};

const domReplace = (): void => {
  document.addEventListener(
    "click",
    ({ target }: MouseEvent): void => {
      const tagName = (target as HTMLElement).tagName.toLowerCase();
      if (tagName === "body" || target?.id === "app") {
        return;
      }
      let classNames = (target as HTMLElement).classList.value;
      classNames = classNames !== "" ? ` class="${classNames}"` : "";
      const id = (target as HTMLElement)?.id
        ? ` id="${(target as HTMLElement)?.id}"`
        : "";
      const innerText = (target as HTMLElement)?.innerText;
      const dom = `<${tagName}${id}${
        classNames !== "" ? classNames : ""
      }>${innerText}</${tagName}>`;
    },
    true
  );
};

const historyReplace = () => {
  let lastHref = document.location.href;
  function historyReplaceFn(originalHistoryFn: {
    apply: (arg0: any, arg1: any[]) => any;
  }) {
    return function (...args) {
      const url = args.length > 2 ? args[2] : undefined;
      if (url) {
        const from = lastHref;
        const to = String(url);
        lastHref = to;

        // 上报路由变化
        if (from === to || from?.slice(-2) === to?.slice(-2)) {
          return;
        }
        axios
          .post("http://127.0.0.1:5175/test", { from, to })
          .then(({ data }) => {
            console.log(data);
          });
      }
      return originalHistoryFn.apply(this, args);
    };
  }
  // 重写pushState事件
  replaceAop(window.history, "pushState", historyReplaceFn);
  // 重写replaceState事件
  replaceAop(window.history, "replaceState", historyReplaceFn);
};
const test1 = () => {
  domReplace();
};

interface ILaunchOption {
  reportUrl: string;
  domTrack?: boolean;
  routerTrack?: boolean;
  xhrTrach: boolean;
}

const launch = (
  option: ILaunchOption = {
    reportUrl: "",
    domTrack: false,
    routerTrack: false,
    xhrTrach: false,
  }
) => {
  if (option.domTrack) {
    domReplace();
  }

  if (option.routerTrack) {
    historyReplace();
  }
  if (option.xhrTrach) {
    xhrReplace(option.reportUrl);
  }
};
export default {
  xhrReplace,
  domReplace,
  historyReplace,
  test1,
  launch,
};
