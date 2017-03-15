export default class Atomate{
    constructor(str){
        this.data = str;
    }

    setData(str){
        this.data = str;
    }

    findOR(str){
        let bracketsCount = 0;
        for (let i = 0; i < str.length; i++){
            if (str[i] == '(') bracketsCount++;
            if (str[i] == ')') bracketsCount--;
            if (bracketsCount == 0 && str[i] == "|")
                return i;
        }
        return -1;
    }

    areBracketsBalanced(){
        let s = this.data;
        let count = 0;
        for (let i = 0; i < s.length; i++) {
            if (s[i] == '(') count++;
            if (s[i] == ')') count--;
            if (count < 0) return false;
        }
        return (count == 0);
    }

    getAtomata(str){
        let pos = this.findOR(str);
        let children = [];
        if (pos != -1){
            let leftAtomata = this.getAtomata(str.substr(0, pos));
            let rightAtomata = this.getAtomata(str.substr(pos + 1));
            children = [leftAtomata, rightAtomata];
        }else{
            let count = 0, positions = [-1, -1];
            for (let i = 0; i < str.length; i++) {
                if (str[i] == '(') {
                    count++;
                    if (count == 1)
                        positions[0] = i;
                }
                if (str[i] == ')') {
                    count--;
                    if (count == 0)
                        positions[1] = i;
                }
                if (count == 0 && positions[0] >= 0 && positions[1] >= 0 && str[i] == ")"){
                    children.push(this.getAtomata(str.substr(positions[0] + 1, positions[1] - positions[0] - 1)));
                }
            }
        }

        return {
            "children": children,
            "source": str
        };
    }

    Do(){
        if (!this.data)
            return "Пустая строка";
        let n = this.data.length;
        let error = null;
        if (!this.areBracketsBalanced())
            return "Скобки не сбалансированы!";
        let atomata = this.getAtomata(this.data);
        console.log(atomata);
        return error === null ? "Все хорошо" : error;
    }
}