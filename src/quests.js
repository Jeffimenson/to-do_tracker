import { isThisWeek, differenceInDays, compareAsc } from "date-fns";

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
    #completionDate;

    #tasks = [];
    #completedTasks = [];

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
        this.#completedTasks.unshift(task);
        this.removeTask(index);
    }
    
    shouldBeComplete(){
        return this.#tasks.length === 0 && this.#completedTasks > 0;
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
    #completedQuests = []; 

    constructor(){}
    
    addQuest(name, tasks){
        const newQuest = new Quest(name, tasks);
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
        this.#completedQuests.push(quest);
        this.removeQuest(index);
    }
    
    cleanCompleted(){
        for (let i = 0; i < this.#completedQuests; i++){
            const quest = this.#completedQuests[i];
            if (quest.beenCompleted()){
                this.#completedQuests.splice(i);
                i--;
            }
        }
    }
}

export {Task, Quest, QuestGroup};