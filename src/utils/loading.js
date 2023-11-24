import { showLoadingToast, closeToast } from 'vant';
import { globals } from '../main.js'
export const loadingHelper = {
    show: (msg) => {
        showLoadingToast({
            overlay: true,
            duration: 0,
            forbidClick: true,
            loadingType: 'spinner',
            message: msg||globals.$t("text.loadingText")
        });
    },
    hide: () => {
        closeToast();
    }
}