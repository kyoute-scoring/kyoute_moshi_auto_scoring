def inputter(string, typ=str):
    inp = ""
    try:
        inp = typ(input(string))
    except KeyboardInterrupt:
        print("\nQuit!")
        exit(0)
    except Exception as e:
        return inputter(string, typ)
    else:
        return inp

def making(num):
    res = {"順番": [], "問題数": {}, "配点": {}}
    for i in range(num):
        txt = f"第{i + 1}問"
        print("---", txt)
        res["順番"].append(txt)
        res["問題数"][txt] = [(inputter("\t解答番号数: ")), (inputter("\t点数: "))]
        res["配点"][txt] = (inputter("\t配点個数: ", int))
        # res["問題数"][f"第{i + 1}問"] = list()
        # res["配点"][f"第{i + 1}問"] = [list()]
    # return __import__("json").dumps(res, indent=4, ensure_ascii=False)
    print(res)
    print("\n"*5)
    # 順番
    print("\"順番\": [\"", end="")
    print('\", \"'.join(res['順番']), end="")
    print("\"],")
    # 問題数
    print("\"問題数\": {")
    for i in range(num):
        txt = res['順番'][i]
        print(f"    \"{txt}\": [{', '.join(res['問題数'][txt])}]", end="")
        if i < num - 1:
            print(",")
        else:
            print("")
    print("},")
    # 配点
    print("\"配点\": {")
    for i in range(num):
        txt = res['順番'][i]
        print(f"    \"{txt}\": [")
        # 配点配列
        for j in range(res["配点"][txt]):
            print("        [\"\", ]", end="")
            if j < res["配点"][txt] - 1:
                print(",")
            else:
                print("")
        print("    ]", end="")
        if i < num - 1:
            print(",")
        else:
            print("")
    print("}")
    return 0

making((inputter("数: ", int)))