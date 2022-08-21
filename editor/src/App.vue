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
import VariableVue from './components/Variable.vue';
import AssignVue from './components/Assign.vue';

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
        expression: "Declarative",
        token: "Number",
        value: null,
      },
      {
        expression: "Variable",
        token: "Variable",
        value: null,
      },
      {
        expression: "Assign",
        token: "Assign",
        operador: '=',
        left: null,
        right: null,
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
    //var root = null;

    //funcion interpreter este sera el encargado de pasar del ast a sintaxis python
    const interpreter = () => {
      console.log('interpretador');
    };

    //funcion para crear arbol
    const createTree = (idNode) => {
      addNode(idNode);
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
      var node = editor.value.getNodeFromId(idNode);

      if (node.name == 'Add' || node.name == 'Sub' || node.name == 'Mul' || node.name == 'Div') {
        nodesTree.push({
          id: node.id,
          token: node.name,
          father: null,
          expression: 'BinOp',
          value: 0,
          childLeft: null,
          childRight: null
        });

      } else {
        switch (node.name) {
          case 'Number':
            nodesTree.push({
              id: node.id,
              token: node.name,
              father: null,
              expression: "Declarative",
              value: 0
            });

            break;
          case 'Assign':
            nodesTree.push({
              id: node.id,
              token: node.name,
              father: null,
              expression: "Assign",
              value: 0,
              childLeft: null,
              childRight: null
            });

            break;
          case 'Variable':
            nodesTree.push({
              id: node.id,
              token: node.name,
              father: null,
              expression: "Variable",
              value: 0,
              variable: null
            });

            break;

          default:
            break;
        }

      }

      console.log(nodesTree);

    };

    //cargar conecciones en ambos nodos
    const updateNode = (connection) => {
      //output_id =  hijos , input_id =padre
      nodesTree.forEach((node) => {
        if (connection.output_id == node.id) {//agregar el padre al hijo
          let dataNodeChild = getDataFatherNode(node.id, connection.input_id);
          editor.value.updateNodeDataFromId(node.id, dataNodeChild);
          node.father = connection.input_id;

        } else if (connection.input_id == node.id) { //agregar los hijos al padre
          let dataNodeFather = getDataChildsNode(node.id, connection.output_id, connection.input_class);
          editor.value.updateNodeDataFromId(node.id, dataNodeFather);
          node.childLeft = dataNodeFather.ChildLeft;
          node.childRight = dataNodeFather.ChildRight;
          node.value = dataNodeFather.Value;

        }
      });

    };

    const getDataFatherNode = (idChild, idFather) => {
      const childSelect = editor.value.getNodeFromId(idChild);
      let dataNode = {};
      let name = childSelect.name;

      if (name == 'Add' || name == 'Sub' || name == 'Mul' || name == 'Div') {
        name = 'BinOp';
      }
      switch (name) {
        case 'BinOp':
          dataNode = {
            Father: idFather, ChildLeft: childSelect.data.ChildLeft,
            ChildRight: childSelect.data.ChildRight,
            Value: childSelect.data.Value
          };
          break;
        case 'Number':
          dataNode = { Father: idFather, Value: childSelect.data.Value };
          break;
        case 'Variable':
          dataNode = { Father: idFather, Variable: childSelect.data.Variable, Value: childSelect.data.Value };
          break;
        case 'Assign':
          dataNode = {
            Father: idFather, ChildLeft: childSelect.data.ChildLeft,
            ChildRight: childSelect.data.ChildRight,
            Value: childSelect.data.Value
          };
          break;
        default:
          console.log('Tipo de nodo del hijo no permitido:',name);
          break;
      }

      return dataNode;

    }

    const getDataChildsNode = (idFather, idChild, input) => {
      const fatherSelect = editor.value.getNodeFromId(idFather);
      let dataNode = {};
      let name = fatherSelect.name;

      if (name == 'Add' || name == 'Sub' || name == 'Mul' || name == 'Div') {
        name = 'BinOp';
      }
      switch (name) {
        case 'BinOp':
          console.log('Padre es BinOp');
          dataNode = getDataChildsNodeOfBinOp(idFather, idChild, input);
          break;
        case 'Number':
          console.log('imposible');
          break;
        case 'Assign':
          console.log('Padre es assign');
          dataNode = getDataChildsNodeOfAssign(idFather, idChild, input);
          break;
        default:
          console.log('No permitido',name);
          break;
      }

      return dataNode;

    }

    //funciones para especificar como agregar los hijos segun el tipo de nodo Padre
    const getDataChildsNodeOfBinOp = (idFather, idChild, input) => {
      let Child = editor.value.getNodeFromId(idChild);
      let value = Child.data.Value;

      let dataFather = editor.value.getNodeFromId(idFather);
      let left = null;
      let right = null;

      if (input== 'input_1') {
        left = idChild;
        right = dataFather.data.ChildRight;
      } else if (input== 'input_2'){
        left = dataFather.data.ChildLeft;
        right = idChild;
      }

      let updatedDataFather = {Father:dataFather.data.Father,ChildLeft:left,ChildRight:right,Value:0};
      editor.value.updateNodeDataFromId(idFather,updatedDataFather);

      let dataNode = getValuesBinOp(idFather,idChild,value);

      console.log('get new data del nodo padre',dataNode);
      return dataNode;
    }

    const getValuesBinOp = (idFather,idChild,valueNew) => {
      const fatherSelect = editor.value.getNodeFromId(idFather);
      let brother = null;

      let num1 = 0;
      let num2 = 0;
      let result = 0;

      console.log(fatherSelect);

      if (fatherSelect.data.ChildLeft == idChild) {
        num1 = valueNew;
        if (fatherSelect.data.ChildRight != null) {
          brother = editor.value.getNodeFromId(fatherSelect.data.ChildRight);
          num2 = brother.data.Value;
        }
      } else if (fatherSelect.data.ChildRight == idChild) {
        num2 = valueNew;
        if (fatherSelect.data.ChildLeft != null) {
          brother = editor.value.getNodeFromId(fatherSelect.data.ChildLeft);
          num1 = brother.data.Value;
        }
      }

      result = getResultOperation(parseInt(num1), parseInt(num2), fatherSelect.name);
      let dataNode = {Father:fatherSelect.data.Father, 
                      ChildLeft:fatherSelect.data.ChildLeft,
                      ChildRight:fatherSelect.data.ChildRight, 
                      Value:result};

      console.log('resultado',result);

      dispatch("setOperationAction", {
        id: idFather,
        value: { Number1: num1, Number2: num2, Result: result }
      });

      return dataNode;

    }

    const getDataChildsNodeOfAssign = (idNode, idChild,input) => {
      const nodeSelect = editor.value.getNodeFromId(idNode);
      let child = editor.value.getNodeFromId(idChild);

      let dataNode = {};
      let child1 = null;
      let child2 = null;
      let value = 0;
      let variable = '';


      switch (input) {
        case 'input_1':
          child1 = idChild;
          child2 = nodeSelect.data.ChildRight;
          variable = child.data.Variable;
          if (child2 != null) {
            let brother = editor.value.getNodeFromId(child2);
            value = brother.data.Value;
          }
          break;
        case 'input_2':
          child2 = idChild;
          child1 = nodeSelect.data.ChildLeft;
          value = child.data.Value;
          if (child1 != null) {
            let brother = editor.value.getNodeFromId(child1);
            variable = brother.data.Variable;
          }
          break;

        default:
          break;
      }

      dataNode = {
        Father: nodeSelect.data.Father,
        ChildLeft: child1,
        ChildRight: child2,
        Value: value
      };

      dispatch("setAssignAction", {
        id: idNode,
        value: { Variable: variable, Value: value }
      });

      console.log({ Variable: variable, Value: value });
      return dataNode;
    }

    //actualizar data nodo BinOp/Assign cuando se actualiza la data del nodo Number
    const updateData = (id) => {
      const node = editor.value.getNodeFromId(id);
      console.log('actualizar data del nodo', node);
      const idFather = node.data.Father;

      nodesTree.forEach(nodeTree => {
        if (nodeTree.token == 'Number') {
          nodeTree.value = parseInt(node.data.number);
        } else if (nodeTree.token == 'Variable') {
          nodeTree.variable = node.data.variable;
        }
      });

      if (idFather != null) {
        switch (node.name) {
          case 'Number':
            updateDataFatherOfNodeNumber(id);
            break;
          case 'Variable':
            updateDataFatherOfNodeVariable(id);
            break;

          default:
            break;
        }

      }
      console.log(nodesTree);
    }

    const updateDataFatherOfNodeNumber = (id) => {
      const node = editor.value.getNodeFromId(id);
      const idFather = node.data.Father;
      const Father = editor.value.getNodeFromId(idFather);
      let name = Father.name;

      if (name == 'Add' || name == 'Sub' || name == 'Mul' || name == 'Div') {
        name = 'BinOp';
      }

      switch (name) {
        case 'Assign':
          updateNodeFatherAssign(id);
          break;
        case 'BinOp':
          updateNodeFatherBinOp(id);
          break;

        default:
          break;
      }

    }

    const updateNodeFatherBinOp = (id) => {
      const node = editor.value.getNodeFromId(id);
      const idFather = node.data.Father;

      let number = parseInt(node.data.number);

      if (node.data.number == '') {//isNaN(parseInt(node.data.number))) {
        number = 0;
      }

      let dataNode = getValuesBinOp(idFather,id,number);

      editor.value.updateNodeDataFromId(idFather, dataNode);

      nodesTree.forEach(node => {
        if (node.id == idFather) {
          node.value = dataNode.Value;
        }
      });
      console.log('udate que pasa',dataNode);
      updateRecursiveArithOp(idFather, dataNode.Value);
    }

    const updateNodeFatherAssign = (id) => {
      const node = editor.value.getNodeFromId(id);
      const idFather = node.data.Father;
      const Father = editor.value.getNodeFromId(idFather);

      let number = parseInt(node.data.number);

      const dataFather = Father.data;

      let childVar = editor.value.getNodeFromId(dataFather.ChildLeft);
      let variable = childVar.data.Variable;

      if (node.data.number == '') {//isNaN(parseInt(node.data.number))) {
        number = 0;
      }

      console.log(nodesTree);
      editor.value.updateNodeDataFromId(idFather, {
        Father: dataFather.Father,
        ChildLeft: dataFather.ChildLeft,
        ChildRight: dataFather.ChildRight,
        Value: number
      });

      nodesTree.forEach(node => {
        if (node.id == idFather) {
          node.value = number;
        }
      });

      dispatch("setAssignAction", { id: idFather, value: { Variable: variable, Value: number } });
    }

    const updateDataFatherOfNodeVariable = (id) => {
      const node = editor.value.getNodeFromId(id);
      const idFather = node.data.Father;

      let variable = node.data.variable;

      const Father = editor.value.getNodeFromId(idFather);
      const dataFather = Father.data;

      editor.value.updateNodeDataFromId(idFather, {
        Father: dataFather.Father,
        ChildLeft: dataFather.ChildLeft,
        ChildRight: dataFather.ChildRight,
        Value: dataFather.Value
      });

      dispatch("setAssignAction", { id: idFather, value: { Variable: variable, Value: dataFather.Value } });
    }

    //recursividad nodo Operaciones Aritmeticas
    const updateRecursiveArithOp = (idFather, newValue) => {

      const nodeFather = editor.value.getNodeFromId(idFather);
      const idNextFather = nodeFather.data.Father;

      if (idNextFather != null) {
        const nextFather = editor.value.getNodeFromId(idNextFather);

        if (nextFather.name == 'Add' || nextFather.name == 'Sub' || nextFather.name == 'Mul' || nextFather.name == 'Div') {

          let dataNode = getValuesBinOp(idNextFather,idFather,newValue);
          editor.value.updateNodeDataFromId(idNextFather,dataNode);

          nodesTree.forEach(node => {
            if (node.id == idNextFather) {
              node.value = dataNode.Value;
            }
          });

          updateRecursiveArithOp(idNextFather, dataNode.Value);

        } else if (nextFather.name == 'Assign') {
          let number = parseInt(newValue);
          let variable = '';

          const dataFather = nextFather.data;

          if (dataFather.ChildLeft != null) {
            let childVar = editor.value.getNodeFromId(dataFather.ChildLeft);
            variable = childVar.data.Variable;
          }

          console.log(nodesTree);
          editor.value.updateNodeDataFromId(idNextFather, {
            Father: dataFather.Father,
            ChildLeft: dataFather.ChildLeft,
            ChildRight: dataFather.ChildRight,
            Value: number
          });

          nodesTree.forEach(node => {
            if (node.id == idNextFather) {
              node.value = number;
            }
          });

          dispatch("setAssignAction", { id: idNextFather, value: { Variable: variable, Value: number } });
          console.log('dispath qu', { Variable: variable, Value: number });

        }
      }
    };

    //calcular operacion aritmetica
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
          editor.value.addNode(arithmeticOp, 2, 1, pos_x, pos_y, arithmeticOp, { Father: null, ChildLeft: null, ChildRight: null, Value: 0 }, arithmeticOp, 'vue');
          break;
        case 'Declarative':
          editor.value.addNode('Number', 0, 1, pos_x, pos_y, 'Number', { Father: null, Value: 0 }, 'Number', 'vue');
          break;
        case 'Assign':
          editor.value.addNode('Assign', 2, 1, pos_x, pos_y, 'Assign', { Father: null, ChildLeft: null, ChildRight: null, Value: 0 }, 'Assign', 'vue');
          break;
        case 'Variable':
          editor.value.addNode('Variable', 0, 1, pos_x, pos_y, 'Variable', { Father: null, Variable: '', Value: 0 }, 'Variable', 'vue');
          break;
        default:
          console.log('no se encontro');
          break;
      }

    };

    const generateCode = () => {
      var exportdata = editor.value.export();
      console.log('nodetree', nodesTree);
      console.log(exportdata);
    };
// funciones para verificar correctas conexiones entre nodos
    const evalutedConnection = (connection) =>{
      const father = editor.value.getNodeFromId(connection.input_id);
      const child = editor.value.getNodeFromId(connection.output_id);
      let nameFather = father.name;
      let nameChild = child.name;
      let valid = false;
      let taken = false;

      if (nameFather == 'Add' || nameFather == 'Sub' || nameFather == 'Mul' || nameFather == 'Div') {
        nameFather = 'BinOp';
      }
      if (nameChild == 'Add' || nameChild == 'Sub' || nameChild == 'Mul' || nameChild == 'Div') {
        nameChild = 'BinOp';
      }

      switch (nameFather) {
        case 'BinOp':
            taken = takenConnection(connection);
            console.log('taken',!taken);
            if ((nameChild=='Number' || nameChild == 'BinOp') && !taken) {
              valid= true
            }
          break;
        case 'Assign':
            taken = takenConnection(connection);
            if ((nameChild=='Number' || nameChild == 'BinOp' ) && connection.input_class == 'input_2' && !taken) {
              valid= true;
            }else if (nameChild=='Variable'  && connection.input_class == 'input_1') {
              valid = false;
            } 
          break;
        case 'If':
          
          break;
        case 'For':
          
          break;
      
        default:
          break;
      }
      return valid;
    }

    const takenConnection = (connection) => {
      const father = editor.value.getNodeFromId(connection.input_id);
      let taken = false;

      if (connection.input_class == 'input_1') {
         if (father.data.ChildLeft != null) {
           taken = true;
         }
        
      }else if (connection.input_class == 'input_2') {
         if (father.data.ChildRight != null) {
           taken = true;
         } 
      }
      return taken;
    }

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

      editor.value.registerNode('Variable', VariableVue, {}, {}, 'vue');
      editor.value.registerNode('Assign', AssignVue, {}, {}, 'vue');


      // Events! saltan cuando sean manipulados los nodos
      editor.value.on('nodeCreated', function (id) {
        console.log("Node created " + id);
        createTree(id); //caundo se cree un nuevo nodo se almacenara en la lista nodos
      })

      // cuando se cree la conexion entre nodos se actualizara el arbol
      editor.value.on('connectionCreated', function (connection) {
        console.log('Connection created');
        console.log(connection);
        let connectionValid = evalutedConnection(connection);
        if (connectionValid) {
          updateNode(connection);
        }else{
          editor.value.removeSingleConnection(connection.output_id,connection.input_id,connection.output_class, connection.input_class);
          window.alert('conexion no valida');
        }
      })

      editor.value.on('nodeDataChanged', function (id) {
        //actualizar datos heredados a otros nodos
        console.log('id del nodo que se actualizo', id);
        updateData(id);


      })


    });

    return { evalutedConnection , updateRecursiveArithOp, getResultOperation, setNodeType, lista, drag, drop, enableDrop, generateCode, interpreter, createTree, addNode, updateNode, updateData };

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
