var budgetController= (function(){
    var Expense= function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };
    Expense.prototype.calcPercentage=function(totalIncome){
        if(totalIncome>0){
            this.percentage=Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage=-1;
        }
    };
    Expense.prototype.getPercentage=function(){
        return this.percentage;
    };
    var Income= function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };

    var calculateTotal=function(type){
        var sum=0;
        data.allItems[type].forEach(function(curr){
            sum +=curr.value;
        });
        data.totals[type]=sum;
    };

    var data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    };

    return {
        addItems:function(type, des, val){
            var newItem,ID;
            //[1 2 3 4 5] nextId =6
            //[1 2 4 6 8] nextID =9
            // ID= lastID+1

            //Create new ID
            if(data.allItems[type].length>0){
                ID= data.allItems[type][data.allItems[type].length - 1].id+1;
            }
            else{
                ID=0;
            }

            //Create new Item based on 'exp' and 'inc' type
            if(type ==='exp'){
                newItem=new Expense(ID,des,val);
            }
            else if(type ==='inc'){
                newItem=new Income(ID,des,val);
            } 

            //Push it into our Data Structure
            data.allItems[type].push(newItem);

            //Return the new Element
            return newItem;
        },
        deleteItem:function(type,id){
            var index,ids;
            
            //id=6
            //ids=[1 2 4 6 8]
            //index=3
            ids=data.allItems[type].map(function(current){
                return current.id;
            });
            index=ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        calculateBudget:function(){

            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //Calculate the budget :income-expenses
            data.budget=data.totals.inc- data.totals.exp;

            //Calculte the percentage of income that we spent
            if(data.totals.inc>0){
                data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
            }
            else{
                data.percentage=-1;
            }
        },
        getBudget:function(){
            return {
                budget:data.budget,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage
            };
        },
        calcPercentages:function(){
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            });
        },
        getPercentages:function(){
            var allPerc=data.allItems.exp.map(function(curr){
                return curr.getPercentage();
            });
            return allPerc;
        },
        testing:function(){
            console.log(data.allItems);
        }
    };

})();

var UIController= (function(){
    var formatNumber=function(num,type){
        var intg,dec,numsplit;
        /*
          1.  + or - before number
          2.   exactly 2 decimal points
          3.   comma separating the thousands
        */
       num=Math.abs(num);
       num=num.toFixed(2);
       numsplit=num.split(".");
       intg=numsplit[0];
       dec=numsplit[1];
       if(intg.length>3){
           intg=intg.substr(0,intg.length-3)+","+intg.substr(intg.length-3,3);
       }

       type==="exp"?sign="-":sign="+";

       return sign+" "+intg+"."+dec;
    }
    return {
        getInput:function(){
            return {
               type:document.querySelector(".add__type").value,
               description:document.querySelector(".add__description").value,
               value:parseFloat(document.querySelector(".add__value").value)
            };
        },
        addListItem:function(obj,type){
            var html,newHtml,element;

            //Creating Html string with placeholder text
            if(type === 'inc'){
                element=".income__list";
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="fas fa-times-circle red"></i></button></div></div></div>';
            }
            else if(type==='exp'){
                element='.expenses__list';
                html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%p%</div><div class="item__delete"><button class="item__delete--btn"><i class="fas fa-times-circle"></i></button></div></div></div>';
            }

            //Replace the placeholder text with actual text

            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));

            //Insert the html into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        deleteListItem:function(selectorId){
            var el=document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        clearFields:function(){
            var fields,fieldsArr;
            fields=document.querySelectorAll(".add__description"+","+".add__value");    //Returns a List
            fieldsArr=Array.prototype.slice.call(fields);             //Converted into arrar and store into fieldsArr
            fieldsArr.forEach(function(curr,index,array){
                curr.value="";
            });            
            fieldsArr[0].focus();       //Return the focus on the first box
        },
        displayBudget:function(obj){
            var type;
            obj.budget>0?type="inc":type="exp";
            document.querySelector(".budget__value").textContent=formatNumber(obj.budget,type);
            document.querySelector(".budget__income--value").textContent=formatNumber(obj.totalInc,"inc");
            document.querySelector(".budget__expenses--value").textContent=formatNumber(obj.totalExp,"exp");
            if(obj.percentage>0){
            document.querySelector(".budget__expenses--percentage").textContent=obj.percentage+"%";
            }
            else{
            document.querySelector(".budget__expenses--percentage").textContent="-1";
            }
        },
        displayPercentages:function(percentages){
            var fields=document.querySelectorAll(".item__percentage");

            var nodeListForEach=function(list,callback){
                for(var i=0;i<list.length;i++){
                    callback(list[i],i);
                }
            };
            nodeListForEach(fields,function(current,index){
                current.textContent=percentages[index]+"%";
            });
        },
        displayMonth:function(){
            var month,months,year,now;
            now=new Date();
            month=now.getMonth();
            year=now.getFullYear();
            months=['January','February','March','April','May','June','July','August','September','October','November','December'];
            document.querySelector(".budget__title--month").textContent=months[month]+" "+year;
        },
        changedType:function(){
            var fields,nodeListForEach;
            fields=document.querySelectorAll(".add__type"+","+".add__description"+","+".add__value");
            nodeListForEach=function(list,callback){
                for(var i=0;i<list.length;i++){
                    callback(list[i],i);
                }
            };
            nodeListForEach(fields,function(curr){
                curr.classList.toggle("red-focus");
            });
            document.querySelector(".add__btn").classList.toggle("red");
        }
    };
})();

var controller = (function(budgetCtrl,UICtrl){
    var setupEventListener=function(){
        document.querySelector(".add__btn").addEventListener("click",ctrlAddItem);
        document.addEventListener("keypress",function(e){
            if(event.keyCode===13 || event.which===13){
                ctrlAddItem();   
            }     
        });
        document.querySelector(".container").addEventListener("click",ctrlDeleteItem);
        document.querySelector(".add__type").addEventListener("change",UICtrl.changedType);
    };
    var updateBudget=function(){
        //1.Calculate the budget
        budgetCtrl.calculateBudget();
        //2.Return the budget
        var budget=budgetCtrl.getBudget();
        //3.Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    var updatePercentages=function(){
        //1.Calculate the percentages
            budgetCtrl.calcPercentages();
        //2.Read the percentages from the budget controller
            var percentages=budgetCtrl.getPercentages();
        //3.Update the UI with new percentages
            UICtrl.displayPercentages(percentages);
    }
    var ctrlAddItem=function(){
        
        // 1.Get the field Input data
        var input=UICtrl.getInput();
        if(input.description !=="" && !isNaN(input.value) && input.value>0){
        // 2.Add the item to the budget controller
        var newItems = budgetCtrl.addItems(input.type, input.description, input.value);
        // 3.Add the item to the UI
        UICtrl.addListItem(newItems,input.type);
        // 4.Clear the input fields
        UICtrl.clearFields();
        // 5.Update the Budget
        updateBudget();
        // 6.Update the percentages
        updatePercentages();
        }
    };

    var ctrlDeleteItem=function(event){
        var itemId,splitId,type,ID;
        itemId=event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            splitId=itemId.split('-');
            type=splitId[0];
            ID=parseInt(splitId[1]);
        }
        // 1. Delete the item from the budget data structure
            budgetCtrl.deleteItem(type,ID);
        // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemId);
        // 3. Update and show the budget    
            updateBudget();
        // 4.Update the percentages
            updatePercentages();

    };
    return {
        init:function(){
            console.log("Application has Started");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:0
            });
            setupEventListener();
        }
    };
})(budgetController,UIController);

controller.init();


