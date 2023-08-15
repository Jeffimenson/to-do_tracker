import { differenceInDays, compareAsc } from "date-fns";

function getDaysOld(date){ //To be used to check if completed tasks and quests are older than 2 days
    const today = new Date();
    const comp = compareAsc(date, today);
    if (comp < 0) {
        const result = differenceInDays(today, date);
        if (result === -0) return 0; 
        return result;
    } else {
        const result = differenceInDays(today, date);
        return (result + 1) * -1;
    }
}

class Task {
    description;
    isOptional;
    #completionDate = null;
    constructor (description, isOptional){
        this.description = description;
        this.isOptional = isOptional;
    }

    get completionDate (){
        return this.#completionDate;
    }

    trackCompletionDate(){
        this.#completionDate = new Date();
    }

    beenCompleted(){
        return getDaysOld(this.#completionDate) > 2; 
    }
}

class Quest {
    name; 

    dueDate;
    #completionDate = null;
    get completionDate (){
        return this.#completionDate;
    }

    resetCompletionDate(){
        this.#completionDate = null;
    }

    #tasks = [];

    get tasks (){
        return this.#tasks;
    }

    get completedTasks (){
        const completed = [];
        for (let i = 0; i < this.#tasks.length; i++){
            const task = this.#tasks[i];
            if (task.completionDate !== null){
                completed.push(task);
            }
        }
        return completed;
    }

    constructor (name, tasks=[], dueDate=null){
        this.name = name; 
        this.#tasks = tasks;
        this.dueDate = dueDate;
    }

    removeTask(index){
        this.#tasks.splice(index, 1);
    } 

    addTask(task){
        this.#tasks.unshift(task);
    }

    completeTask(index){
        const task = this.#tasks[index];
        task.trackCompletionDate();
    }
    
    shouldBeComplete(){
        return this.#tasks.length === 0 && this.completedTasks.length > 0;
    }

    trackCompletionDate(){
        this.#completionDate = new Date();
    }
    
    beenCompleted(){
        return getDaysOld(this.#completionDate) > 2; 
    }
}

class QuestGroup {
    #quests = [];

    constructor(){}

    get quests (){
        return this.#quests;
    }

    get completedQuests (){
        const completed = [];
        for (quest of this.#quests){
            if (quest.completionDate !== null){
                completed.push(quest);
            }
        }
        return completed;
    }
    
    addQuest(newQuest){
        this.#quests.push(newQuest);
    }

    removeQuest(index){
        this.#quests.splice(index, 1);
    }

    swapQuests(i1, i2){
        const temp = this.#quests[i1];
        this.#quests[i1] = this.#quests[i2];
        this.#quests[i2] = temp;
    }

    getQuest(index){
        return this.#quests[index];
    }

    completeQuest(index){
        const quest = this.#quests[index];
        quest.trackCompletionDate();
    }
    
    cleanCompleted(){
        for (let i = 0; i < this.completedQuests.length; i++){
            const quest = this.completedQuests[i];
            if (quest.beenCompleted()){
                const quesInd = this.#quests.indexOf(quest);
                this.removeQuest(quesInd);
                i--;
            }
        }
    }
}

export {Task, Quest, QuestGroup};