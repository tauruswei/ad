import { showLoadingToast, closeToast } from 'vant';
export const loadingHelper = {
    show: (msg) => {
        showLoadingToast({
            forbidClick: true,
            loadingType: 'spinner',
            message: msg||"loading..."
        });
    },
    hide: () => {
        closeToast();
    }
}