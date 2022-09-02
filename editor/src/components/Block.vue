<template>
    <div>
        <h2 class="text-2xl">Block Code</h2>
        <button type="button" class="btn btn-primary" @click="addNewConnectionChild">Add Block</button>
        <button type="button" class="ms-2 btn btn-primary" @click="removeNewConnectionChild">Remove Block</button>
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
        const removeNewConnectionChild = () =>{
            editor.value.removeNodeInput(nodeId,'input_1');
            console.log('a ver si se agrego el input',editor.value.getNodeFromId(nodeId));
        }
    onMounted(() => {
         
      });
        return {addNewConnectionChild,removeNewConnectionChild};
    }
}
</script>