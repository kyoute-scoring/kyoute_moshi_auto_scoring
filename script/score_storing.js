console.log("Score Storing Script Loaded");
const save_score = () => {
    let subject, subject_ct,
        temp, res;
    res = [];
    // `subject_ct`_`subject`_`answer1`,`answer2`,.../`subject_ct2`_`subject2`_...
    $("input.subject_select:checked").each((i, e) => {
        subject = e.id.split("_")[1];
        subject_ct = e.parentNode.id;
        temp = [];
        $(`ul.${subject}`).children("li").children(":checked").each((j, answer) => {
            temp.push(answer.id.split("-").slice(1).join("-"));
        })
        temp = temp.join(",")
        res.push(`${subject_ct}_${temp}`)
    })
    // ローカルストレージに保存
    localStorage.setItem($("select#exams").val(), res.join("/"));
    console.log("Strage Saved");
    return res.join("/");
}

const load_score = () => {
    // $(`input#select_英語リーディング`).prop("checked", true)
    // for (var i = 0; i < a.length; i++) {
    //     $(`input#${a[i]}`).prop("checked", true)
    // }
    let temp;
    // ローカルストレージから読み込み
    localStorage.getItem($("select#exams").val()).split("/").forEach((subject_data, subject_ct) => {
        /*
         * temp[0]: subject_ct
         * temp[1]: subject
         * temp[2]: answers
        */
        temp = subject_data.split("_");
        $(`input#select_${temp[1]}`).prop({"checked": true})
        temp[2].split(",").forEach((answer, answer_ct) => {
            $(`input#${temp[0]}-${answer}`).prop({"checked": true})
        })
    })
    console.log("Strage Loaded")
}

$(() => {
    $("button#save").click(e => {
        save_score();
    })
    $("button#load").click(e => {
        load_score();
    })
})