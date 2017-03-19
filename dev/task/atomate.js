export default class Atomate{
    constructor(str){
        this.setData(str);
    }

    setData(str){
        this.data = str;
        this.states = {};
        this.stars = [];
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

    addState(terminal_0 = [], terminal_1 = [], terminal_e = []){
        let name = this.getAvailableName();
        this.states[name] = {
            'name': name,
            '0': terminal_0,
            '1': terminal_1,
            'e': terminal_e
        };
        return name;
    }

    stateAddNext(name, terminal, next){
        if (!this.states[name]) return false;
        this.states[name][terminal.toString()].push(next);
        return true;
    }

    // bindAllStars(){
    //     let states = this.states;
    //     this.stars.forEach(star => {
    //         // у нас есть объект с полями 'name' (имя состояние, которое является входом для звезды)
    //         // и 'ends' - массивом имен, в которые надо провести Е дуги
    //         this.states.forEach((state, stateNum) => {
    //             // state - состояние из всех возможных
    //             // если его выходы (nexts) идут в наше (star.name), то надо бы добавить еще одно следующее состояние
    //             // ведущее на выходы нашего
    //             let stateNexts = state.nexts;
    //             state.nexts.forEach(next => {
    //                 if (next == star.name){
    //                     stateNexts.concat(star.ends);
    //                     return false;
    //                 }
    //             });
    //             states[stateNum].nexts = stateNexts;
    //         });
    //     });
    //     this.states = states;
    // }

    getAtomata(str, s_end = ['R'], isStar = 0){
        if (!str.length) return s_end;
        
        // ищем 'ИЛИ'
        let pos = this.findOR(str);

        if (pos != -1){
            // 'ИЛИ' внутри строки
            // получение входных и выходных состояний левых и правых частей 'ИЛИ'
            let left = this.getAtomata(str.substr(0, pos), s_end, isStar);
            let right = this.getAtomata(str.substr(pos + 1), s_end, isStar);

            // начало может быть null, если это пустая строка ('|10', left.begins === null)
            // тогда можем сразу задать ей конец s_end (это переданное конечное состояние)
            if (left === null) left = s_end;
            if (right === null) right = s_end;

            let names = left.concat(right);

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

                // обработка всего
                let nextsAfterBrackets = s_end;
                let names = [];
                if (positions + 1 < str.length) // если после скобок есть что-то
                    nextsAfterBrackets = this.getAtomata(str.substr(positions + 1), s_end);
                if (nextsAfterBrackets === true || nextsAfterBrackets === false){
                    // если после скобок звезда или плюсик
                    // то берем то, что после плюсика или звезды
                    nextsAfterBrackets = this.getAtomata(str.substr(positions + 2), s_end);
                    names = this.getAtomata(str.substr(1, positions - 1), nextsAfterBrackets, 1);
                }else{
                    names = this.getAtomata(str.substr(1, positions - 1), nextsAfterBrackets);
                }
                return names;
            }else if (str[0] == '1' || str[0] == '0'){
                // если это не все, что выше, то это обычный символ
                let name = this.addState();
                if (isStar){
                    // если мы начали с этой строки и у нас флаг
                    // isStar в тру, то надо в конечный элемент добавить начальный
                    // заодно надо бы добавить в особый массив stars текущие вхождения и выходы
                    // чтобы потом спокойно перебиндить все состояния, которые входят в это
                    // на Е дугу к концу
                    this.stars.push({
                        'name': name,
                        'ends': s_end
                    });
                    s_end.push(name);
                    isStar = false;
                }
                let nexts = s_end;
                let isStar = false;
                let isPlus = false;
                if (str.length >= 2){
                    nexts = this.getAtomata(str.substr(1), s_end);
                    if (nexts === true || nexts === false){
                        // если следующий элемент - звезда или плюс
                        // заранее узнаем что это, ибо дальше эта переменная меняется
                        if (nexts) isStar = true;
                        else isPlus = true;

                        // а тут берем рекурсию от следующего элемента
                        if (str.length >= 3)
                            nexts = this.getAtomata(str.substr(2), s_end);
                        else
                            nexts = s_end;

                        // а тут мы добавляем возврат на наш текущий элемент
                        // надо же вернуться
                        nexts = nexts.concat(name);
                    }
                    if (isStar){
                        // this.addInfoToState(name, {'is'});
                    }
                }

                // после всех действий надо бы обновить следующие элементы в хранилище
                this.stateAddNext(name, str[0], next);
                // this.updateState(name, nexts);
                return [name];
            }else if (str[0] == '*' || str[0] == '+'){
                // ввозвращение из getAtomata true свидетельствует о знаке * (false о знаке +), иначе объект
                return str[0] == '*';
            }else if (str[0] != ')'){
                let er = "Неподдерживаемый символ: " + str[0];
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
        
        this.states['S'] = {
            '0': [],
            '1': [],
            'e': []
        };
        this.states.push({
            'name': 'S',
            'terminal': null,
            'nexts': []
        });
        this.states.push({
            'name': 'R',
            'terminal': 'e',
            'nexts': []
        });
        try{
            let inputNames = this.getAtomata(this.data, ['R']);
            this.updateState('S', inputNames);
            this.bindAllStars();
        }catch(e){
            error = e;
        }
        return error === null ? this.states : error;
    }
}