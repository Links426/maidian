<template>
  <div>123</div>
  <button @click="test(123)">123</button>
  <button @click="router.push('/main')">main</button>
  <button @click="router.push('/')">///</button>
  <button @click="getJsError">js错误</button>

  <div class="test">123</div>
  <div class="App">
    <div class="btn-wrap">
      <button @click="startRecording">开始录制</button>
      <button @click="replay">回放</button>
    </div>
    <div class="textArea-wrap">
      <textarea rows="10" cols="50">这里是一个文本输入框</textarea>
    </div>
    <div v-if="isPlaying" ref="videoRef" id="replay"></div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { useRouter } from "vue-router";
import { ref, reactive } from "vue";
import rrwebPlayer from "rrweb-player";
import { record } from "rrweb";
import "rrweb-player/dist/style.css";
const isPlaying = ref(false);
const videoRef = ref(null);
const events = [];

let stopFn = null;
let replayInstance = null;

const startRecording = () => {
  stopFn = record({
    emit(event) {
      events.push(event);
      console.log(event);
    },
  });
};

const replay = () => {
  stopFn();
  isPlaying.value = true;
  setTimeout(() => {
    if (videoRef.value) {
      if (replayInstance) {
        return;
      }
      replayInstance = new rrwebPlayer({
        target: videoRef.value,
        props: {
          events,
        },
      });
    }
  }, 1);
};
const router = useRouter();
const test = (data) => {
  // xhrReplace();
  axios.post("http://127.0.0.1:5175/test", { name: "123" }).then((res) => {
    console.log(res.data);
  });
};

const getJsError = () => {
  let a = null;
  console.log(a.length);
};
</script>

<style scoped></style>
