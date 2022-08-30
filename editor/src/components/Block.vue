<template>
    <div>
        <h2 class="text-2xl">Block Code</h2>
        <span class="text-lg"><a>Block Code</a></span>
        <button type="button" class="btn btn-primary" @click="addNewConnectionChild">Add Block</button>
    </div>
</template>

<script>
import {getCurrentInstance,onMounted} from "vue";
export default {
    name: 'BlockVue',
    setup() {

        const internalInstance = getCurrentInstance();
        let editor = internalInstance.appContext.app._context.config.globalProperties.$editor;
        const nodeId = editor.value.nodeId;

        const addNewConnectionChild = () =>{
            editor.value.addNodeInput(nodeId);
            console.log('a ver si se agrego el input',editor.value.getNodeFromId(nodeId));
        }
    onMounted(() => {
         
      });
        return {addNewConnectionChild};
    }
}
</script>