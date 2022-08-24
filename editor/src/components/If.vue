<template>
    <div>
        <h2 class="text-2xl">If</h2>
        <span class="text-lg"><a>Condicion</a></span>

        <input  class="form-control" type="number" @change="changeExpr"  v-model="expr1"/>


        <select class="form-select mt-3" aria-label="Default select example" v-model="operator" @change="changeExpr">
        <option selected>Operador</option>
        <option style="text-align: center;" value="<"> <h1>  &lt; </h1> </option>
        <option style="text-align: center;" value=">"> <h1> > </h1> </option>
        <option style="text-align: center;" value="=="> <h1>==</h1> </option>
        <option style="text-align: center;" value="!="> <h1>!=</h1> </option>
        <option style="text-align: center;" value="<="> <h1>>=</h1> </option>
        <option style="text-align: center;" value=">="> <h1> &lt;= </h1> </option>
      

        </select>
        <input  class="form-control mt-3" type="number" @change="changeExpr" v-model="expr2"/>
    </div>
</template>

<script>
import {getCurrentInstance, ref, onMounted} from "vue";
export default {
    name: 'IfVue',
    setup() {
        const expr1 = ref(0);
        const expr2 = ref(0);
        const operator = ref('');
       

        const internalInstance = getCurrentInstance();
        let editor = internalInstance.appContext.app._context.config.globalProperties.$editor;
        const nodeId = editor.value.nodeId;

        const changeExpr = () => {
             let node = editor.value.getNodeFromId(nodeId);
             editor.value.updateNodeDataFromId(nodeId,
             {Father:node.data.Father, ChildLeft:node.data.ChildLeft, ChildRight: node.data.ChildRight,
             Expr1:expr1.value, Operator:operator.value, Expr2:expr2.value});

             console.log(editor.value.getNodeFromId(nodeId)); 
        }
    onMounted(() => {
         
      });
        return {changeExpr,expr1,expr2,operator};
    }
}
</script>