import * as constant from "../common/common_constant";
import * as message from "../common/common_message";
import * as page from "../common/common_page";

export class PersonalCareerManagement {
    process() {
        page.removeGoogleAnalyticsScript();
        doProcess();
    }
}

function doProcess() {
    const imageHTML = constant.getNPCImageHTML("白皇");
    message.createFooterMessage(imageHTML);
    message.writeFooterMessage("是的，你没有看错，换人了，某幕后黑手不愿意出镜。不过请放心，转职方面我是专业的，毕竟我一直制霸钉耙榜。<br>");

    console.log(page.currentPageHTML());
}