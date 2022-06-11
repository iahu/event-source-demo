const connect = require("connect");

const http = require("http");
const fs = require("fs");
const { setInterval, clearInterval } = require("timers");

const app = connect();

const getEventContent = ({ id = "", type, data }) => {
  // each content line should not starts with white space
  return `
id: ${id}
event: ${type}
data: ${JSON.stringify(data)}
`;
};

const dateTime = () => new Date().toLocaleString();

const maxEvents = 5;
app.use("/es", (req, res, next) => {
  if (req.headers.accept === "text/event-stream") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      connection: "keep-alive",
    });
    let count = 0;

    res.write(
      getEventContent({
        id: count,
        type: "connected",
        data: `connected at ${dateTime()}`,
      })
    );

    const tid = setInterval(() => {
      count += 1;
      if (count > maxEvents) {
        res.write(
          getEventContent({
            id: count,
            type: "close",
            data: `closed at ${dateTime()}`,
          })
        );
        // delay 2s to close connect
        setTimeout(() => {
          clearInterval(tid);
          res.end();
        }, 2000);
      } else {
        res.write(
          getEventContent({
            id: count,
            type: "ping",
            data: `response at ${dateTime()}`,
          })
        );
      }
    }, 1000);
  }

  next();
});

app.use("/", (req, res, next) => {
  if (req.url === "/") {
    const page = fs.readFileSync("index.html");
    res.writeHead(200);
    res.end(page);
  }
  next();
});

http.createServer(app).listen(3000);
console.log("server listen on 3000");
