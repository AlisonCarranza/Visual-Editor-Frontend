<template>

  <div id="app">

    <div class="container cuerpo">
      <div class="row">
        <div class="col-3">
          <ul class="list-group">
            <h3 style="text-align: center">Principal</h3>
            <hr />
            <li class="list-group-item">
              <div class="btn-group" role="group" aria-label="Basic example">
                <button type="button" class="btn btn-primary" id="toggle-btn" v-on:click="generateCode()">
                  Generar Codigo
                </button>
              </div>
            </li>

            <h3 style="text-align: center" class="mt-3">Operaciones</h3>
            <hr />
            <li class="list-group-item" v-for="(n, id) in lista" :key="id" draggable="true" :data-node="n.token"
              @dragstart="drag($event)" @dragover="enableDrop($event)">
              <div class="card node" style="background-color: pink">
                <div class="card-body">
                  <h5 class="card-title">{{ n.token }}</h5>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="col-9">
          <div id="drawflow" @drop="drop($event)" @dragover="enableDrop($event)">
            <h1 class="p-5" style="color: white">!!</h1>
          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<script>
import Drawflow from 'drawflow'
import { h, getCurrentInstance, render, readonly, onMounted, shallowRef } from 'vue'

import NumberVue from './components/Number.vue';
import BinaryOperations from './components/BinaryOperations.vue';

//vuex
import { useStore } from "vuex";


export default {
  name: 'App',
  components: {

  },

  setup() {
    const editor = shallowRef({});
    const internalInstance = getCurrentInstance();
    const Vue = { version: 3, h, render };

    //almacenar como propiedad global el objeto editor
    internalInstance.appContext.app._context.config.globalProperties.$editor = editor;

    //acceso a store para manejar estados
    const { dispatch } = useStore();

    const lista = readonly([
      {
        expression: "Integer",
        token: "Number",
        value: null,
      },
      {
        expression: "BinOp",
        token: "Add",
        operador: '+',
        left: null,
        right: null,
      },
      {
        expression: "BinOp",
        token: "Sub",
        operador: '-',
        left: null,
        right: null,
      },
      {
        expression: "BinOp",
        token: "Mul",
        operador: '+',
        left: null,
        right: null,
      },
      {
        expression: "BinOp",
        token: "Div",
        operador: '-',
        left: null,
        right: null,
      }
    ]);

    var nodesTree = [];
    var root = null;

    //funcion interpreter este sera el encargado de pasar del ast a sintaxis python
    const interpreter = () => {
      console.log('interpretador');
    };

    //funcion para crear arbol
    const createTree = (idNode) => {
      console.log(nodesTree);
      console.log(idNode);

      addNode(idNode);

      console.log(root);
      console.log(nodesTree);

    };

    //actualizar raiz arbol
    /*const foundRoot = () => {
      nodesTree.forEach(node => {
        if(node.nodeFather==null){
           root = node.id;
           console.log("root tree:",root);
        }
      });

    };*/

    const addNode = (idNode) => {
      console.log(nodesTree);
      console.log(idNode);

      var node = editor.value.getNodeFromId(idNode);
      console.log(node);

      if (node.name == 'Add' || node.name == 'Sub' || node.name == 'Mul' || node.name == 'Div') {
        nodesTree.push({
          id: node.id,
          token: node.name,
          father: null,
          expression: 'BinOp',
          result: null,
          childLeft: null,
          childRight: null
        });

      } else if (node.name == 'Number') {
        nodesTree.push({
          id: node.id,
          token: node.name,
          father: null,
          expression: "Integer",
          value: 0
        });

      }

      console.log(nodesTree);

    };

    //cargar conecciones nodo
    const updateNode = (connection) => {
      console.log('conexion info : ', connection)

      //output_id =  hijos , input_id =padre
      nodesTree.forEach((node) => {
        if (connection.output_id == node.id) {
          let nodeChild = editor.value.getNodeFromId(node.id);
          //update editor nodes
          editor.value.updateNodeDataFromId(node.id, { Father: connection.input_id, Num: nodeChild.data.Num });
          //update nodes Tree
          node.father = connection.input_id;

          console.log(nodesTree);

        } else if (connection.input_id == node.id) {
          let num1 = 0;
          let num2 = 0;
          let Child1 = null;
          let Child2 = null;


          let nodefather = editor.value.getNodeFromId(node.id);


          if (connection.input_class == 'input_1' && node.childLeft == null) {
            //update nodes tree
            node.childLeft = connection.output_id;

            Child1 = editor.value.getNodeFromId(connection.output_id);
            num1 = Child1.data.Num;

            if (node.childRight != null) {
              Child2 = editor.value.getNodeFromId(node.childRight);
              num2 = Child2.data.Num;
            }

          } else if (connection.input_class == 'input_2' && node.childRight == null) {
            node.childRight = connection.output_id;

            Child2 = editor.value.getNodeFromId(connection.output_id);
            num2 = Child2.data.Num;

            if (node.childLeft != null) {
              Child1 = editor.value.getNodeFromId(node.childLeft);
              num1 = Child1.data.Num;
            }

          }
          console.log(nodesTree);

          let result = getResultOperation(parseInt(num1), parseInt(num2), nodefather.name);

          editor.value.updateNodeDataFromId(node.id, {
            Father: nodefather.data.Father,
            ChildLeft: node.childLeft,
            ChildRight: node.childRight,
            Result: result
          });

          console.log('impresion nodo al crear conexion info padre', editor.value.getNodeFromId(node.id));
          dispatch("setOperationAction", { id: connection.input_id, value: { Number1: num1, Number2: num2, Result: result } });
        }
      });
    };


    //actualizar data nodo BinOp cuando se actualiza la data del nodo Number
    const updateData = (id) => {

      console.log('actualizar data del nodo:wtf', id);
      const node = editor.value.getNodeFromId(id);
      console.log('actualizar data del nodo:wtf', node);
      const idFather = node.data.Father;
      if (idFather != null) {

        let num1 = 0;
        let num2 = 0;
        let number = node.data.number;

        const Father = editor.value.getNodeFromId(idFather);
        const dataFather = Father.data;
        if (isNaN(parseInt(node.data.number))) {
          number = 0;
        }

        if (dataFather.ChildLeft == id) {
          num1 = number;
          if (dataFather.ChildRight != null) {
            let brother = editor.value.getNodeFromId(dataFather.ChildRight);
            num2 = brother.data.Num;
          }

        } else if (dataFather.ChildRight == id) {
          num2 = number;
          if (dataFather.ChildLeft != null) {
            let brother = editor.value.getNodeFromId(dataFather.ChildLeft);
            num1 = brother.data.Num;
          }
        }
        console.log(nodesTree);

        let result = getResultOperation(parseInt(num1), parseInt(num2), Father.name);

        editor.value.updateNodeDataFromId(idFather, {
          Father: dataFather.Father,
          ChildLeft: dataFather.ChildLeft,
          ChildRight: dataFather.ChildRight,
          Result: result
        });

        nodesTree.forEach(node => {
             if (node.id == idFather) {
                 node.result = result;
             }
        });

        dispatch("setOperationAction", { id: idFather, value: { Number1: num1, Number2: num2, Result: result } });
        console.log('dispath', { Number1: num1, Number2: num2, Result: result, Father: dataFather.Father });
      }
    }

    const getResultOperation = (num1, num2, name) => {

      let result;

      switch (name) {
        case 'Add':
          result = num1 + num2;
          break;
        case 'Sub':
          result = num1 - num2;
          break;
        case 'Mul':
          result = num1 * num2;
          break;
        case 'Div':
          if (num2 == 0) {
            result = 0;
          } else {
            result = num1 / num2;
            result = Math.round(result);//result.toFixed(2);
          }
          break;
        default:
          break;
      }

      return result;
    };

    var mobile_item_selec = "";
    var mobile_last_move = null;



    const drag = (ev) => {
      if (ev.type === "touchstart") {
        mobile_item_selec = ev.target
          .closest(".drag-drawflow")
          .getAttribute("data-node");
      } else {
        ev.dataTransfer.setData("node", ev.target.getAttribute("data-node"));
      }
    };

    const drop = (ev) => {
      if (ev.type === "touchend") {
        var parentdrawflow = document
          .elementFromPoint(
            mobile_last_move.touches[0].clientX,
            mobile_last_move.touches[0].clientY
          )
          .closest("#drawflow");
        if (parentdrawflow != null) {
          addNodeToDrawFlow(
            mobile_item_selec,
            mobile_last_move.touches[0].clientX,
            mobile_last_move.touches[0].clientY
          );
        }
        mobile_item_selec = "";
      } else {
        ev.preventDefault();
        var token = ev.dataTransfer.getData("node");
        addNodeToDrawFlow(token, ev.clientX, ev.clientY);
      }
    };

    const enableDrop = (ev) => {
      ev.preventDefault();
    };

    const addNodeToDrawFlow = (name, pos_x, pos_y) => {
      pos_x = pos_x * (editor.value.precanvas.clientWidth / (editor.value.precanvas.clientWidth * editor.value.zoom)) - (editor.value.precanvas.getBoundingClientRect().x * (editor.value.precanvas.clientWidth / (editor.value.precanvas.clientWidth * editor.value.zoom)));
      pos_y = pos_y *
        (editor.value.precanvas.clientHeight / (editor.value.precanvas.clientHeight * editor.value.zoom)) -
        (editor.value.precanvas.getBoundingClientRect().y *
          (editor.value.precanvas.clientHeight / (editor.value.precanvas.clientHeight * editor.value.zoom)));

      setNodeType(name, pos_x, pos_y);
    };

    const setNodeType = (token, pos_x, pos_y) => {
      console.log('setNodeType', token);
      let data = {};
      let name = '';
      let arithmeticOp = '';

      lista.forEach(nodeType => {
        if (nodeType.token == token) {
          data = nodeType;
          name = nodeType.expression;
        }

      });
      switch (name) {
        case 'BinOp':
          arithmeticOp = data.token;
          editor.value.addNode(arithmeticOp, 2, 1, pos_x, pos_y, arithmeticOp, { Father: null, ChildLeft: null, ChildRight: null, Result: 0 }, arithmeticOp, 'vue');
          break;
        case 'Integer':
          editor.value.addNode('Number', 0, 1, pos_x, pos_y, 'Number', { Father: null, Num: 0 }, 'Number', 'vue');
          break;
        default:
          console.log('no se encontro');
          break;
      }

    };

    const generateCode = () => {
      var exportdata = editor.value.export();
      console.log(exportdata);
    };



    onMounted(() => {

      var id = document.getElementById("drawflow");

      // Pass render Vue 3 Instance
      editor.value = new Drawflow(id, Vue, internalInstance.appContext.app._context);
      editor.value.start();

      //////////////////////////////////////////////////////////////////////////////////////////////////////

      //registrar componentes
      editor.value.registerNode('Number', NumberVue, {}, {}, 'vue');
      editor.value.registerNode('Add', BinaryOperations, { title: 'Add' }, {}, 'vue');
      editor.value.registerNode('Sub', BinaryOperations, { title: 'Sub' }, {}, 'vue');
      editor.value.registerNode('Mul', BinaryOperations, { title: 'Mul' }, {}, 'vue');
      editor.value.registerNode('Div', BinaryOperations, { title: 'Div' }, {}, 'vue');

      // Events! saltan cuando sean manipulados los nodos
      editor.value.on('nodeCreated', function (id) {
        console.log("Node created " + id);
        createTree(id); //caundo se cree un nuevo nodo se almacenara en la lista nodos
      })

      // cuando se cree la conexion entre nodos se actualizara el arbol
      editor.value.on('connectionCreated', function (connection) {
        console.log('Connection created');
        console.log(connection);

        updateNode(connection);
      })

      editor.value.on('nodeDataChanged', function (id) {
        //actualizar datos heredados a otros nodos
        updateData(id);

      })


    });

    return { getResultOperation, setNodeType, lista, drag, drop, enableDrop, generateCode, interpreter, createTree, addNode, updateNode, updateData };

  }


}
</script>

<style>
#app1 {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #050505;
  font-size: 13px;
  text-align: initial;
  width: 100vw;
  height: 94.5vh;
  padding: 2px;
  margin: 5px;
}

#drawflow {
  width: 100%;
  height: 100%;
  border: 3px solid rgb(169, 112, 177);
  border-radius: 10px;
  text-align: initial;
  background: linear-gradient(-90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(-90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
    linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
    linear-gradient(transparent 3px,
      #f2f2f2 3px,
      #f2f2f2 78px,
      transparent 78px),
    linear-gradient(-90deg, #aaa 1px, transparent 1px),
    linear-gradient(-90deg,
      transparent 3px,
      #f2f2f2 3px,
      #f2f2f2 78px,
      transparent 78px),
    linear-gradient(#aaa 1px, transparent 1px), #f2f2f2;
  background-size: 4px 4px, 4px 4px, 80px 80px, 80px 80px, 80px 80px, 80px 80px,
    80px 80px, 80px 80px;
}

.node {
  display: block;
  line-height: 40px;
  margin: 10px 0px;
  cursor: move;
  text-align: center;
}

.cuerpo {
  border-radius: 10px;
  border: 1px none rgb(169, 112, 177);
  box-shadow: 0 0 30px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);
  margin: 0px;
  padding: 2%;
}

/**nuevo */
.drawflow .drawflow-node {
  border-radius: 8px;
  background: pink !important;
  border: 2px solid #494949;
  color: black;
  min-width: 100px;
}

.drawflow .drawflow-node.selected {
  background: rgb(129, 37, 138) !important;
  border: 2px solid rgb(241, 241, 241);
}

.drawflow .drawflow-node .drawflow_content_node input,
.drawflow .drawflow-node .drawflow_content_node .el-select,
.drawflow .drawflow-node .drawflow_content_node button {
  width: 100%;
}
</style>
