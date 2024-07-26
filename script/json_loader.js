let exams = {};
let exam_data = {};

const question_kigo = (kigo, num) => {
    switch (kigo) {
        case "1":
            return String(num + 1);
        case "ア":
            return "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"[num%46];
    }
}
const ans_kigo = (kigo, num) => {
    switch (kigo[num]) {
        case "+":
            return "±";
        default:
            return kigo[num];
    }
}

const exam_loader = exam_name => {
    $.getJSON(`./exams/${exams[exam_name].json}`)
    .done(data => {
        console.log(`Exam(${exams[exam_name].json}) data Loaded`);
        exam_data = data;

        let div_content, list_content, item_content,
            subject_data, question_ct;
        /*
         * exam_data: jsonのデータ
         
         * subject: 教科名
         * subject_ct: exam_data内の教科の配列番号
         * subject_data: exam_data[subject]

         * question: 大問
         * section_ct: subject_data内の大問の配列番号
         * question_ct: 問題配列番号
        */
        // 何かしら記入されていれば確認をする
        if ($("input:checked").length > 0) {
            if (!window.confirm("解答欄に記入があります。模試を変えますか?")) {
                return 1;
            }
        }
        // 記入卵を追加
        $("div#input_answer, div#result").html("");
        Object.keys(exam_data).forEach((subject, subject_ct) => {
            /* 教科ごとに行う */
            subject_data = exam_data[subject];
            div_content = $("<div>").addClass("subject", subject);
            // <h3>教科</h3>
            $("<h3>").text(subject).appendTo(div_content);
            // 開閉ボタン
            $("<button>").text("開く").attr("id", "subject_close").addClass(subject).click(e => {
                $(e.target).toggleClass("opened").text( ($(e.target).hasClass("opened")) ? "閉じる" : "開く" )
                    .next().next().next().fadeToggle(200);
            }).appendTo(div_content);
            // 選択ボタン
            $("<input>").attr({"type": "checkbox", "id": `select_${subject}`}).addClass(subject).click(e => {
                if (!$(`button.${subject}`).hasClass("opened") && e.target.checked) { // 閉まってて、チェックされた時
                    $(e.target).prev().click();
                }
            }).appendTo(div_content);
            $("<label>").attr({"for": `select_${subject}`}).text("この教科を選択する").addClass(subject).appendTo(div_content);
            question_ct = 0;
            list_content = $("<ul>").addClass("answer_input", subject).attr("id", subject);
            subject_data["順番"].forEach((question, section_ct) => {
                /* 大問ごとに行う */
                // <h4>大問</h4>
                $("<h4>").text(question).appendTo(list_content);
                // 解答番号を1に戻すかどうか
                if (subject_data["解答記号"][1]) {
                    question_ct = 0;
                }
                for (var i = 0; i < subject_data["問題数"][question][0]; i++) {
                    /* 解答番号ごとに行う */
                    item_content = $("<li>");
                    $("<span>").text(question_kigo(subject_data["解答記号"][0], question_ct)).appendTo(item_content);
                    for (var j = 0; j < subject_data["記号"].length; j++) {
                        // <input type="radio" name="問" value="記号" id="大問-問-記号"><label for="大問-問-記号">記号</label>
                        $("<input>").attr({"type": "radio", "name": `${subject_ct}-${section_ct}-${i}`, "id": `${subject_ct}-${section_ct}-${i}-${j}`}).val(j).click(e => {
                            if (!$(`input#select_${subject}`).prop("checked")) {
                                $(`input#select_${subject}`).click()
                            }
                        }).appendTo(item_content);
                        $("<label>").attr({"for": `${subject_ct}-${section_ct}-${i}-${j}`}).text(ans_kigo(subject_data["記号"], j)).appendTo(item_content);
                        // "id": `${subject_ct}-${section_ct}-${i}-${ans_kigo(subject_data["記号"], j)}`
                    }
                    item_content.appendTo(list_content);
                    question_ct++;
                }
            })
            list_content.appendTo(div_content).hide();
            div_content.appendTo("div#input_answer");
        })
    })
    .fail(data => {
        console.log("Load failed");
        console.log(data);
    });
    return 0;
};

$(() => {
    // 模試選択
    $.getJSON(`./exam.json`)
    .done(data => {
        console.log("Exam data Loaded");
        exams = data;
        Object.keys(exams).forEach(key => {
            $("<option>").val(key).text(key).appendTo("select#exams");
        })
    })
    .fail(data => {
        console.log("Load failed");
        console.log(data);
    });

    //
    $("select#exams").change(e => {
        exam_loader(e.target.value);
    })
})