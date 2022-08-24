<template>
    <div>
        <h4 class="text-2xl">For</h4>
       <span><a>Valor Inicial</a></span>
        <input class="form-control" type="number" v-model="expr1"  @change="changeExpr" @keyup="changeExpr"/>
        <span><a>Valor Final</a></span>
        <input class="form-control" type="number"  v-model="expr2" @change="changeExpr" @keyup="changeExpr"/>
    </div>
</template>
 
<script>
/*eslint-disable */
import {getCurrentInstance, ref, onMounted} from "vue";
export default {
    name: 'ForVue',
    setup() {
        const expr1 = ref(0);
        const expr2 = ref(0);

        const internalInstance = getCurrentInstance();
        let editor = internalInstance.appContext.app._context.config.globalProperties.$editor;
        const nodeId = editor.value.nodeId;

        const changeExpr = () => {
           let node = editor.value.getNodeFromId(nodeId);

           editor.value.updateNodeDataFromId(nodeId,
           {Father:node.data.Father, ChildLeft:node.data.ChildLeft, ChildRight: node.data.ChildRight,
            Start:expr1.value, Finish:expr2.value});
           console.log(editor.value.getNodeFromId(nodeId));
        };

        onMounted(() => {

      });
     return {expr1,expr2,changeExpr}
    }
}
</script>

<style>
    input{
        width: 100%;
    }
</style>