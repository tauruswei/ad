import { showToast } from 'vant';
export function copyClick(val) {
    if(!val) return;
    const input = document.createElement('input') // 创建input对象
    input.value = val // 设置复制内容
    document.body.appendChild(input) // 添加临时实例
    input.select() // 选择实例内容
    document.execCommand('Copy') // 执行复制
    document.body.removeChild(input) // 删除临时实例
    showToast('Copyed！')
}