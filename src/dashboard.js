export class TownDashboardProcessor {

    constructor() {
    }

    process() {
        this.#renderHTML();
    }

    #renderHTML() {
        $("option[value='INN']").text("客栈·驿站");
        $("option[value='LETTER']").text("口袋助手设置");
        $("option[value='LETTER']").attr("style", "background:#20c0ff");
        $("option[value='CHANGEMAP']").text("冒险家公会");

        // 读取角色当前的能力值
        const text = $("#c_001").find("table:last").find("td:first").text();
        let idx = text.indexOf("Lv：");
        let s = text.substring(idx);
        const level = parseInt(s.substring(3, s.indexOf(" ")));
        idx = text.indexOf("攻击力：");
        s = text.substring(idx);
        const attack = parseInt(s.substring(4, s.indexOf(" ")));
        idx = s.indexOf("防御力：");
        s = s.substring(idx);
        const defense = parseInt(s.substring(4, s.indexOf(" ")));
        idx = s.indexOf("智力：");
        s = s.substring(idx);
        const specialAttack = parseInt(s.substring(3, s.indexOf(" ")));
        idx = s.indexOf("精神力：");
        s = s.substring(idx);
        const specialDefense = parseInt(s.substring(4, s.indexOf(" ")));
        idx = s.indexOf("速度：");
        s = s.substring(idx);
        const speed = parseInt(s.substring(3));

        // 主页面如果角色满级则经验(大于等于14900)显示为蓝色
        $("td:parent").each(function (_idx, td) {
            const text = $(td).text();
            if (text === "经验值") {
                const expText = $(td).next().text();
                const exp = expText.substring(0, expText.indexOf(" EX"));
                if (exp >= 14900) {
                    $(td).next().attr("style", "color: blue");
                    $(td).next().text("[MAX]");
                }
            }
            if (text === "身份") {
                if (level !== 150 && (attack === 375 || defense === 375
                    || specialAttack === 375 || specialDefense === 375 || speed === 375)) {
                    $(td).next().attr("style", "color: red");
                }
            }
            if (text === "资金") {
                const cashText = $(td).next().text();
                const cash = cashText.substring(0, cashText.indexOf(" Gold"));
                if (cash >= 1000000) {
                    $(td).next().attr("style", "color: red");
                }
            }
        });
    }
}