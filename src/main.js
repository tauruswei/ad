import store from "./store/index";
import router from "./router/index";
import App from "./App.vue";
import { createApp } from "vue";
import 'vant/lib/index.css';
import { MetaMask } from "./utils/meta-mask";
//require("../mock/index.js");
import { Tab, Tabs, NavBar, Button, Col, Row, Image as VanImage, Tag, NumberKeyboard, Field, CellGroup, Dialog, Icon, Grid, GridItem, Popup, List, Cell, Empty, PullRefresh, TextEllipsis } from 'vant';
const app = createApp(App);
import VConsole from 'vconsole';
console.log(process.env.NODE_ENV)
// if (process.env.NODE_ENV == "development") {
    //手机端调试
    const vConsole = new VConsole();
    //app.use(vConsole)
    console.log(11111);
// }
app.use(Tab).use(Tabs).use(NavBar).use(Button).use(Col).use(Row)
    .use(VanImage).use(Tag).use(NumberKeyboard).use(Field).use(CellGroup)
    .use(Dialog).use(Icon).use(Grid).use(GridItem).use(Popup).use(List)
    .use(Empty).use(Cell).use(PullRefresh).use(TextEllipsis)
app.config.globalProperties.metaMask = new MetaMask();
app.use(store).use(router).mount("#app");

app.config.errorHandler = (err, vm, info) => {
    console.log(err, vm, info)
}
app.config.warnHandler = (msg, instance, trace) => {
    console.log(msg, instance, trace)
}

