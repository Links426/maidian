import fs from "fs";
import path, { resolve } from "path";
import process from "process";
import sourceMap from "source-map-js";

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
const currentDirPath = process.cwd();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(cors());

app.post("/test", (req, res) => {
  const requestBody = req.body;
  res.send(requestBody);
});

app.post("/checkfile", async (req, res) => {
  const requestBody = req.body;

  const filePath = requestBody.fileName;

  const startIndex = filePath.indexOf("dist/");
  const result = filePath.substring(startIndex + 5);

  fs.readFile("../../dist/" + result + ".map", "utf8", (err, data) => {
    if (err) {
      console.error("读取文件时发生错误:", err);
      return;
    }

    console.log("文件内容:", data);
    res.send(data);
  });
});

const port = 5175;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
