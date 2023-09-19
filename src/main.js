import store from "./store/index";
import router from "./router/index";
import App from "./App.vue";
import { createApp } from "vue";
import 'vant/lib/index.css';
import { MetaMask } from "./utils/meta-mask";
//require("../mock/index.js");
import { Tab, Tabs,NavBar,Button,Col, Row,Image as VanImage,Tag,NumberKeyboard,Field, CellGroup,Dialog,Icon,Grid, GridItem,Popup,List,Cell,Empty ,PullRefresh,TextEllipsis} from 'vant';
const app = createApp(App);
app.use(Tab).use(Tabs).use(NavBar).use(Button).use(Col).use(Row)
   .use(VanImage).use(Tag).use(NumberKeyboard).use(Field).use(CellGroup)
   .use(Dialog).use(Icon).use(Grid).use(GridItem).use(Popup).use(List)
   .use(Empty).use(Cell).use(PullRefresh).use(TextEllipsis)
app.config.globalProperties.metaMask = new MetaMask();
app.use(store).use(router).mount("#app");

//手机端调试
import VConsole from 'vconsole'; 
const vConsole = new VConsole({ // 配置选项 
    defaultPlugins: ['system', 'network', 'element'], 
    // 默认开启的插件 
    onReady() { 
 
        console.log('vConsole is ready!'); 
 
    }, 
});

app.config.errorHandler = (err, vm, info) => {
    console.log(err,vm,info)
}
app.config.warnHandler = (msg, instance, trace) => {
    console.log(msg,instance,trace)
}

