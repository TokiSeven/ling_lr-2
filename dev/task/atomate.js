export default class Atomate{
    constructor(str){
        this.data = str;
        this.states = [];
    }

    setData(str){
        this.data = str;
        this.states = [];
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

    getAvailableName(){
        return 'St_' + this.states.length;
    }

    addState(terminal, nexts){
        let name = this.getAvailableName();
        this.states.push({
            'name': name,
            'terminal': terminal,
            'nexts': nexts
        });
        return name;
    }

    getStatePos(name){
        let num = -1;
        this.states.forEach((v, i) => {
            if (v.name == name){
                num = i;
                return false;
            }
        });
        return num;
    }

    updateState(name, nexts = null, terminal = null){
        let num = this.getStatePos(name);
        if (num == -1) return false;
        if (nexts !== null) this.states[num].nexts = nexts;
        if (terminal !== null) this.states[num].terminal = terminal;
        return true;
    }

    getAtomata(str, s_end = ['R']){
        if (!str.length) return s_end;
        let pos = this.findOR(str);

        if (pos != -1){
            // 'ИЛИ' внутри строки
            let left = this.getAtomata(str.substr(0, pos), s_end);
            let right = this.getAtomata(str.substr(pos + 1), s_end);
            if (left === null) left = s_end;
            if (right === null) right = s_end;
            let names = [].concat(left).concat(right);
            return names;
        }else{
            // нет явного ИЛИ (только внутри скобок, но это отдельно обрабатывается)
            // обработка символа (если не скобка, иначе обработка скобки рекурсивно)

            if (str[0] == '('){
                // поиск закрывающей строки
                let count = 1;
                let positions = -1;
                for (let i = 1; i < str.length && count; i++) {
                    if (str[i] == '('){
                        count++;
                    } else if (str[i] == ')') {
                        count--;
                        if (count == 0) positions = i;
                    }
                }
                let nextsAfterBrackets = s_end;
                if (positions + 1 < str.length)
                    nextsAfterBrackets = this.getAtomata(str.substr(positions + 1), s_end);
                let names = this.getAtomata(str.substr(1, positions - 1), nextsAfterBrackets);
                return names;
            }else if (str[0] == '1' || str[0] == '0'){
                // если это не все, что выше, то это обычный символ
                let name = this.addState(str[0], []);
                let nexts = str.length > 1 ?
                    this.getAtomata(str.substr(1), s_end) :
                    s_end;
                this.updateState(name, nexts);
                return [name];
            }else if (str[0] != ')' || str[0] != '*' || str[0] != '+'){
                let er = "Неподдерживаемый символ: " + str[0];
                er += "\nТекущая строка: " + str;
                er += "\nТекущие концы: " + s_end.join(', ');
                throw er;
            }
        }
    }

    Do(){
        if (!this.data)
            return "Пустая строка";
        let n = this.data.length;
        let error = null;
        if (!this.areBracketsBalanced())
            return "Скобки не сбалансированы!";
        
        this.states.push({
            'name': 'S',
            'terminal': null,
            'nexts': []
        });
        let inputNames = this.getAtomata(this.data);
        this.updateState('S', inputNames);
        this.states.push({
            'name': 'R',
            'terminal': 'e',
            'nexts': []
        });
        console.log(this.states);
        return error === null ? "Все хорошо" : error;
    }
}