export class TownWeaponStore {
    process() {
        // 删除最后一个google-analytics的脚本
        $("script:last").remove();

        doProcess();
    }
}

function doProcess() {
}