<template>
    <div>
       <h4>Print</h4>
       <br/>
       <input class="form-control" type="text" placeholder="Message" @change="changeVar" @keyup="changeVar" df-msg/>
    </div>
 </template>
 
 <script>
 import { onMounted,getCurrentInstance  } from "vue";
 
 export default {
    name: "PrintVue",
 
    setup() {
 
       const internalInstance = getCurrentInstance();
       let editor = internalInstance.appContext.app._context.config.globalProperties.$editor;
       const nodeId = editor.value.nodeId;
 
       const changeVar = (e) => {
            editor.value.updateNodeDataFromId(nodeId, {Value:e.target.value});
            console.log('print',editor.value.getNodeFromId(nodeId));
         }
       
       onMounted(() => {
          
       });
 
       return { changeVar};
    }
 };
 </script>
 
 <style>
 
 </style>