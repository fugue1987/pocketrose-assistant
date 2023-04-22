import * as dashboard from "../dashboard";
import {WildDashboardProcessor} from "../dashboard";
import * as personal_status from "./personal_status";
import * as personal_salary_paid from "./personal_salary_paid";
import * as option from "../option";
import * as personal_item_management from "./personal_item_management";
import * as personal_treasure_bag from "./personal_treasure_bag";
import * as personal_golden_cage from "./personal_golden_cage";
import * as personal_pet_management from "./personal_pet_management";
import {PersonalCareerManagement} from "./personal_career_management";

export class PersonalRequestInterceptor {

    constructor() {
    }

    process() {
        const text = $("body:first").text();
        if (location.href.includes("/status.cgi")) {
            if (text.includes("城市支配率")) {
                // 城市主页面
                new dashboard.TownDashboardProcessor().process();
            }
            if (text.includes("请选择移动的格数")) {
                new WildDashboardProcessor().process();
            }
        }
        if (location.href.includes("/mydata.cgi")) {
            if (text.includes("仙人的宝物")) {
                // 个人状态查看
                new personal_status.PersonalStatus().process();
            } else if (text.includes("领取了") || text.includes("下次领取俸禄还需要等待")) {
                // 领取薪水
                new personal_salary_paid.PersonalSalaryPaid().process();
            } else if (text.includes("＜＜　|||　物品使用．装备　|||　＞＞")) {
                // 物品使用．装备
                if (option.__cookie_getEnableNewItemUI()) {
                    new personal_item_management.PersonalItemManagement().process();
                }
            } else if (text.includes("物品 百宝袋 使用")) {
                // 进入百宝袋
                new personal_treasure_bag.PersonalTreasureBag().process();
            } else if (text.includes("物品 黄金笼子 使用")) {
                // 进入黄金笼子
                new personal_golden_cage.PersonalGoldenCage().process();
            } else if (text.includes("宠物现在升级时学习新技能情况一览")) {
                // 宠物状态
                if (option.__cookie_getEnableNewPetUI()) {
                    new personal_pet_management.PersonalPetManagement().process();
                }
            } else if (text.includes("* 转职神殿 *")) {
                // 转职
                new PersonalCareerManagement().process();
            }
        }
    }
}