const radiobox_color = (radiobox_num, answer_ct, select_txt, color) => {
    if (!Number.isNaN(radiobox_num)) {
        // console.log(`${radiobox_num}-${answer_ct}-${select_txt}, color: ${color}`)
        $(`input[name="${radiobox_num}-${answer_ct}"]`).each((i, e) => {
            if ($(e).next().text() == select_txt) {
                $(e).next().css("backgroundColor", color);
            }
        })
    }
}

const check_answer = (correct_data, correct_point, answer_data, answer_ct, radiobox_num = NaN) => {
    let temp, check, point, temp_index;
    point = correct_point;
    check = true;
    // 前の問題参照
    if (correct_data.indexOf("^") != -1) {
        temp = [ correct_data.split("&") ]; // 参照先と、今の答えを分離
        temp.push( temp[0][0].split("^") ); // 参照先の、戻る数を確認
        temp.push( check_answer(temp[1].slice(-1)[0], 0, answer_data, answer_ct - (temp[1].length - 1)) );
        // チェック
        if (temp[2][0]) {
            return check_answer(temp[0][1], correct_point, answer_data, answer_ct);
        } else {
            radiobox_color(radiobox_num, answer_ct, answer_data(answer_ct), "red");
            check = false;
            point = 0;
        }
    }
    // 順序あり完全一致
    else if (correct_data.indexOf(",") != -1) {
        correct_data.split(",").forEach((nums) => {
            // 順序ありの中に、順序なし(ex: 1.2,3,4.5)
            if (nums.indexOf(".") != -1) {
                temp = check_answer(nums, answer_data, answer_ct, NaN);
                // チェック
                if (temp[0]) {
                    radiobox_color(radiobox_num, answer_ct, answer_data(answer_ct), "green");
                } else {
                    radiobox_color(radiobox_num, answer_ct, answer_data(answer_ct), "red");
                    radiobox_color(radiobox_num, answer_ct, nums, "blue");
                    check = false;
                    point = 0;
                }
                answer_ct = temp[1] + 1;
            }
            // チェック
            if (nums == answer_data(answer_ct)) {
                radiobox_color(radiobox_num, answer_ct, answer_data(answer_ct), "green");
            } else {
                radiobox_color(radiobox_num, answer_ct, answer_data(answer_ct), "red");
                radiobox_color(radiobox_num, answer_ct, nums, "blue");
                check = false;
                point = 0;
            }
            answer_ct++;
        })
        answer_ct--;
    }
    // 順序なし完全一致
    else if (correct_data.indexOf(".") != -1) {
        temp = correct_data.split(".");
        temp.forEach((nums) => {
            // チェック
            if (temp.indexOf(String(answer_data(answer_ct))) == -1) {
                radiobox_color(radiobox_num, answer_ct, answer_data(answer_ct), "red");
                radiobox_color(radiobox_num, answer_ct, nums, "blue");
                check = false;
                point = 0;
            } else {
                radiobox_color(radiobox_num, answer_ct, answer_data(answer_ct), "green");
            }
            answer_ct++;
        })
        answer_ct--;
    }
    // 順序なし各一致
    else if (correct_data.indexOf("/") != -1) {
        check = false;
        point = 0;
        temp = correct_data.split("/");
        temp.forEach((nums) => {
            temp_index = temp.indexOf(String(answer_data(answer_ct)));
            // チェック
            if (temp_index == -1) {
                radiobox_color(radiobox_num, answer_ct, answer_data(answer_ct), "green");
            } else {
                radiobox_color(radiobox_num, answer_ct, answer_data(answer_ct), "red");
                radiobox_color(radiobox_num, answer_ct, nums, "blue");
                check = true;
                point += correct_point;
                temp[temp_index] = -1;
            }
            answer_ct++;
        })
        answer_ct--;
    }
    // それ以外
    else {
        // チェック
        if (correct_data == answer_data(answer_ct)) {
            radiobox_color(radiobox_num, answer_ct, answer_data(answer_ct), "green");
        } else {
            radiobox_color(radiobox_num, answer_ct, answer_data(answer_ct), "red");
            radiobox_color(radiobox_num, answer_ct, correct_data, "blue");
            check = false;
            point = 0;
        }
    }
    // console.log(`---: ${[check, answer_ct, point]}`)
    return [check, answer_ct, point];
}

const scoring = () => {
    let subject_data, temp,
        answer_ct, answer, answer_nums,
        res, j;
    res = {};
    /*
     * exam_data: jsonのデータ
     
     * subject: 教科名
     * subject_ct: exam_data内の教科の配列番号
     * subject_data: exam_data[subject]

     * question: 大問
     * section_ct: subject_data内の大問の配列番号
     * question_ct: 問題配列番号

     * res[subject]: 点数
     * answer_ct: 解答の配列番号
     * answer_num: 解答の番号
     * correct_point: 正解の番号と配点
     * correct_num: 正解の番号
    */
    $("div#result").html("");
    Object.keys(exam_data).forEach((subject, subject_ct) => {
        if (!$(`input[type='checkbox'].${subject}`).prop("checked")) {
            return;
        }
        /* 教科ごとに行う */
        subject_data = exam_data[subject];
        res[subject] = 0;
        subject_data["順番"].forEach((question, section_ct) => {
            /* 大問ごとに行う */
            answer_ct = 0;
            answer_num = (ans) => { return subject_data["記号"][$(`input[name="${subject_ct}-${section_ct}-${ans}"]:checked`).val()] };
            subject_data["配点"][question].forEach((correct_point) => {
                // 部分点
                temp = [false, 0, 0];
                correct_point[0].split(";").forEach((correct_num, i, correct_array) => {
                    if (!temp[0]) {
                        j = i + 1;
                        while (correct_point[j] == undefined) {
                            j--;
                        }
                        temp = check_answer(correct_num, correct_point[j], answer_num, answer_ct, `${subject_ct}-${section_ct}`);
                        // ; のループが終わるか、正解までは、answer_ctを動かさない。
                        if (temp[0] || i >= correct_array.length - 1) {
                            res[subject] += temp[2];
                            answer_ct = temp[1];
                            // if (temp[2] != 0) {
                            // }
                            $("<span>").text(`\t+${temp[2]}`).appendTo( $(`input[name="${subject_ct}-${section_ct}-${answer_ct}"]`).parent() )
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
        "国語": ["国語", "現代文", "古文", "漢文"],
        "数学": ["数学I", "数学IA", "数学IIBC",
            "旧数学I", "旧数学IA", "旧数学II", "旧数学IIB", "旧簿記・会計", "旧情報関係基礎"],
            // "数学Ⅰ", "数学ⅠＡ", "数学ⅡＢＣ",
            // "旧数学ⅠＡ", "旧数学ⅡＢ"],
        "外国語": ["英語リーディング", "英語リスニング", "ドイツ語", "フランス語", "中国語", "韓国語"],
        "理科": ["物理", "化学", "生物", "地学", "物理基礎", "化学基礎", "生物基礎", "地学基礎"],
        "歴公": ["地理総合,地理探究", "歴史総合,日本史探究", "歴史総合,世界史探究", "公共,倫理", "公共,政治・経済", "地理総合/歴史総合/公共",
            "旧日本史A", "旧日本史B", "旧世界史A", "旧世界史B", "旧地理A", "旧地理B", "旧現代社会", "旧倫理", "旧政治・経済", "旧倫理,旧政治・経済",
            "地理総合、地理探究", "歴史総合、日本史探究", "歴史総合、世界史探究", "公共、倫理", "公共、政治・経済", "地理総合", "歴史総合", "公共"],
            // "旧日本史Ｂ", "旧世界史Ｂ", "旧地理Ｂ", "旧現代社会", "旧倫理", "旧政治・経済", "旧倫理、旧政治・経済"],
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
        $("input").next().css("backgroundColor", "")
        scores = scoring();
        list_content = $("<ul>");
        Object.keys(exam_data).forEach((subject) => {
            if (!$(`input[type='checkbox'].${subject}`).prop("checked")) {
                return;
            }
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

    $("button#lock_btn").click((e) => {
        if ($(`input`).attr("disabled")) {
            if (window.confirm("解答を解除します。よろしいですか?")) {
                $(e.target).text("解答をロックする");
                $(`input`).attr("disabled", false);
            }
        } else {
            if (window.confirm("解答をロックします。よろしいですか?")) {
                $(e.target).text("解答を解除する");
                $(`input`).attr("disabled", true)
            }
        }
    })

    $("button#clear_btn").click(e => {
        if (window.confirm("解答を全て白紙にします。よろしいですか?")) {
            $("input").prop('checked',false);
        }
    })
})