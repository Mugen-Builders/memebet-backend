import CartesifyBackend from "@calindra/cartesify-backend";
import { App } from "@deroll/app";
import express from "express";

let dapp:App
CartesifyBackend.createDapp().then(initDapp => {
    initDapp.start().then(() => {
        console.log('Dapp initialized')
    }).catch((e) => {
        console.error(e);
        process.exit(1);
    });
    dapp = initDapp
})



const app = express();
const port = 8383;
app.use(express.json());

app.get("/health", async (req, res) => {
  req.header("x-msg_sender")
  await dapp.createNotice({payload:"0x1234"});
  res.send({ some: "response" });

});


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});