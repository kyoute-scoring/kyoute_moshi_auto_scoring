const check_answer = (correct_data, answer_data, answer_ct = 0) => {
    let temp, check;
    check = true;
    // 順序あり完全一致
    if (correct_data.indexOf(",") != -1) {
        correct_data.split(",").forEach((nums) => {
            if (nums != answer_data(answer_ct)) {
                check = false;
            }
            answer_ct++;
        })
        answer_ct--;
    }
    // 順序なし完全一致
    else if (correct_data.indexOf(".") != -1) {
        temp = correct_data.split(".");
        temp.forEach((nums) => {
            if (temp.indexOf(String(answer_data(answer_ct))) == -1) {
                check = false;
            }
            answer_ct++;
        })
        answer_ct--;
    }
    // それ以外
    else {
        if (correct_data != answer_data(answer_ct)) {
            check = false;
        }
    }
    return [check, answer_ct];
}

const scoring = () => {
    let subject_data, temp,
        answer_ct, answer, answer_nums,
        res;
    res = {};
    Object.keys(exam_data).forEach((subject, subject_ct) => {
        /* 教科ごとに行う */
        subject_data = exam_data[subject];
        res[subject] = 0;
        subject_data["順番"].forEach((question, section_ct) => {
            /* 大問ごとに行う */
            answer_ct = 0;
            answer_num = (ans) => { return subject_data["記号"][$(`input[name="${subject_ct}-${section_ct}-${ans}"]:checked`).val()] };
            subject_data["配点"][question].forEach((correct_point) => {
                // 部分点
                temp = [false, 0]
                correct_point[0].split(";").forEach((correct_num, i) => {
                    if (!temp[0]) {
                        temp = check_answer(correct_num, answer_num, answer_ct);
                        if (temp[0]) {
                            res[subject] += correct_point[i + 1];
                            answer_ct = temp[1];
                        }
                        // console.log(`#${subject_ct}-${section_ct}-${answer_ct}: correct: ${correct_num} / result: ${temp}`);
                    }
                })
                answer_ct++;
            })
        })
    })
    return res;
}

$(() => {
    $("button#confirm_btn").click(e => {
        let list_content, scores, max_point;
        scores = scoring();
        list_content = $("<ul>");
        Object.keys(exam_data).forEach((subject, subject_ct) => {
            max_point = 0;
            if (exam_data[subject]["満点"] == undefined) {
                Object.values(exam_data[subject]["問題数"]).forEach(point => {
                    max_point += point[1];
                })
            } else {
                max_point = exam_data[subject]["満点"];
            }
            $("<li>").text(`${subject}: ${scores[subject]} / ${max_point} (${Math.round(scores[subject]/max_point * 100 * 10)/10}%)`).appendTo(list_content);
        })
        list_content.appendTo("div#result");
    })
})