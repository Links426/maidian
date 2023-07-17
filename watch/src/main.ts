import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import Track from "track";
import axios from "axios";

import router from "./router";
import ErrorStackParser from "error-stack-parser";
import sourceMap from "source-map-js";
// import axios from "axios";
const app = createApp(App);

// Track.test222();

Track.launch({
  reportUrl: "http://127.0.0.1:5175/test",
  xhrTrach: true,
  routerTrack: true,
  domTrack: true,
});


app.config.errorHandler = (err, vm, info) => {
  // 获取报错的堆栈信息

  const parseError = ErrorStackParser.parse(err)[0];

  axios
    .post("http://127.0.0.1:5175/checkfile", { fileName: parseError.fileName })
    .then((res) => {
      const mapData = res.data;
      const consumer = new sourceMap.SourceMapConsumer(mapData);

      const lookUpResult = consumer.originalPositionFor({
        line: parseError.lineNumber as any,
        column: parseError.columnNumber as any,
      });
      console.log(lookUpResult);
      const code = consumer.sourceContentFor(lookUpResult.source);

      console.log(code, "还原之后的 code");
    });
};

app.use(router);
app.mount("#app");
