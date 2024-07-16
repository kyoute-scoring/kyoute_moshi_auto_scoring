const check_answer = (correct_data, answer_data, answer_ct = 0) => {
    let temp, check;
    check = true;
    // 順序あり完全一致
    if (correct_data.indexOf(",") != -1) {
        correct_data.split(",").forEach((nums) => {
            if (nums.indexOf(".") != -1) {
                temp = check_answer(nums, answer_data, answer_ct);
                if (!temp[0]) {
                    check = false;
                }
                answer_ct = temp[1] + 1;
            }
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

const calc_sum = (subject, score, max_pt, score_sum) => {
    let subject_correspondence = {
        "国語": ["現代文", "古文", "漢文"],
        "数学": ["数学I", "数学IA", "数学IIBC",
            "旧数学I", "旧数学IA", "旧数学II", "旧数学IIB", "旧簿記・会計", "旧情報関係基礎"],
        "外国語": ["英語リーディング", "英語リスニング", "ドイツ語", "フランス語", "中国語", "韓国語"],
        "理科": ["物理", "化学", "生物", "地学", "物理基礎", "化学基礎", "生物基礎", "地学基礎"],
        "歴公": ["地理総合,地理探究", "歴史総合,日本史探究", "歴史総合,世界史探究", "公共,倫理", "公共,政治・経済", "地理総合/歴史総合/公共", 
            "旧日本史A", "旧日本史B", "旧世界史A", "旧世界史B", "旧地理A", "旧地理B", "旧現代社会", "旧倫理", "旧政治・経済", "旧倫理,旧政治・経済"],
        "情報": ["情報I", "旧情報"]
    };
    // 拡大教科名: subject_correspondenceの中のkey
    Object.keys(subject_correspondence).forEach((sub_name) => {
        // 教科名が拡大教科名の中にあるか, もしくはその名前か
        if (subject_correspondence[sub_name].indexOf(subject) != -1 || sub_name == subject) {
            Object.keys(score_sum).forEach((sum_name) => {
                // 拡大教科名がscore_sumの中にあるか
                if (score_sum[sum_name][0].indexOf(sub_name) != -1) {
                    score_sum[sum_name][1] += score;
                    score_sum[sum_name][2] += max_pt;
                }
            })
        }
    })
    return score_sum;
}

$(() => {
    $("button#confirm_btn").click(e => {
        let list_content, scores, max_point,
            score_sum = {
                "全科目": [["国語", "数学", "外国語", "理科", "歴公", "情報"], 0, 0],
                "旧過程": [["国語", "数学", "外国語", "理科", "歴公"], 0, 0],
                "英数国": [["国語", "数学", "外国語"], 0, 0],
                "国語": [["国語"], 0, 0],
                "理科": [["理科"], 0, 0],
                "歴公": [["歴公"], 0, 0],
                "英国歴公": [["国語", "外国語", "歴公"], 0, 0],
                "英数理": [["数学", "外国語", "理科"], 0, 0],
            };
        scores = scoring();
        list_content = $("<ul>");
        Object.keys(exam_data).forEach((subject) => {
            // 満点
            max_point = 0;
            if (exam_data[subject]["満点"] == undefined) {
                Object.values(exam_data[subject]["問題数"]).forEach(point => {
                    max_point += point[1];
                })
            } else {
                max_point = exam_data[subject]["満点"];
            }
            score_sum = calc_sum(subject, scores[subject], max_point, score_sum);
            $("<li>").text(`${subject}: ${scores[subject]} / ${max_point} (${Math.round(scores[subject]/max_point * 100 * 10)/10}%)`).appendTo(list_content);
        })
        $("<h4>").text("合計点").appendTo(list_content);
        Object.keys(score_sum).forEach((sum_name) => {
            $("<li>").text(`${sum_name}: ${score_sum[sum_name][1]} / ${score_sum[sum_name][2]} (${Math.round(score_sum[sum_name][1]/score_sum[sum_name][2] * 100 * 10)/10}%)`).appendTo(list_content);
        })
        list_content.appendTo("div#result");
    })
})