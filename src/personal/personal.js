import * as dashboard from "../dashboard/dashboard";
import {WildDashboardProcessor} from "../dashboard/dashboard";
import * as personal_status from "./personal_status";
import * as personal_salary_paid from "./personal_salary_paid";
import * as personal_item_management from "./personal_item_management";
import * as personal_treasure_bag from "./personal_treasure_bag";
import * as personal_golden_cage from "./personal_golden_cage";
import * as personal_pet_management from "./personal_pet_management";
import {PersonalCareerManagement} from "./personal_career_management";
import * as setup from "../setup/setup";

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
                // 地图主页面
                new WildDashboardProcessor().process();
            }
            if (text.includes("城堡") && text.includes("入口。")) {
                // 城堡有很多中间确认页面，意义不大，平白无故增加了点击的消息
                // 把这些页面修改为自动确认返回
                $("input:submit").trigger("click");
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
                // 装备管理
                if (setup.isItemManagementUIEnabled()) {
                    new personal_item_management.PersonalItemManagement().process();
                }
            } else if (text.includes("物品 百宝袋 使用")) {
                // 百宝袋
                new personal_treasure_bag.PersonalTreasureBag().process();
            } else if (text.includes("物品 黄金笼子 使用")) {
                // 黄金笼子
                new personal_golden_cage.PersonalGoldenCage().process();
            } else if (text.includes("宠物现在升级时学习新技能情况一览")) {
                // 宠物管理
                if (setup.isPetManagementUIEnabled()) {
                    new personal_pet_management.PersonalPetManagement().process();
                }
            } else if (text.includes("* 转职神殿 *")) {
                // 职业管理
                if (setup.isCareerManagementUIEnabled()) {
                    new PersonalCareerManagement().process();
                }
            } else if (text.includes("给其他人发送消息")) {
                // 助手设置
                new setup.PersonalSetup().process();
            }
        }
    }
}