<template>

  <div id="app">
    <div class="container cuerpo">
      <div class="row">
        <div class="col-3">
          <div class="mb-2">
              <h3 style="text-align: center">Principal</h3>
              <hr />
              <div class="d-flex justify-content-center list-group-secondary">
                <div class="btn-group-vertical" role="group" aria-label="Basic example">
                  <button type="button" class="btn btn-primary" id="toggle-btn1" v-on:click="generateCode()">
                    Get Code
                  </button>
                  <button type="button" class="btn btn-primary" id="toggle-btn2" v-on:click="openModalListPrograms()">
                    Program List 
                  </button>
                </div>
              </div> 
              <hr />
          </div>
          <div class="wrapper">
            <ul class="list-group barra">
              <h3 style="text-align: center" class="mt-3">Operaciones</h3>
              <hr />
              <li class="list-group-item list-group-item-secondary" v-for="(n, id) in lista" :key="id" draggable="true" :data-node="n.token"
                @dragstart="drag($event)" @dragover="enableDrop($event)">
                <div class="card node" style="background-color: rgba(251, 47, 193,0.6);color:white">
                  <div class="card-body">
                    <h5 class="card-title">{{ n.token }}</h5>
                  </div>
                </div>
              </li>
            </ul>
          </div>         
        </div>
        <div class="col-9">
          <div id="drawflow" @drop="drop($event)" @dragover="enableDrop($event)">
            
          </div>
        </div>
      </div>
    </div>

  </div>
  <!--Modal Lists Code-->
  <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">List Programs</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Program id</th>
              </tr>
            </thead>
            <tbody>
              <tr @click="setCode(item.uid)" v-for="(item, index) in listPrograms" :key = "index">
                <th scope="row">{{ index }}</th>
                <td>Programa {{ item.uid }}</td>
              </tr>
            </tbody>
          </table>
          <nav aria-label="Page navigation example">
            <ul class="pagination justify-content-end">
              <li class="page-item ">
                <a class="page-link" v-on:click="nextPage(1)">Previous</a>
              </li>
              <li class="page-item">
                <a class="page-link" v-on:click="nextPage(2)">Next</a>
              </li>
            </ul>
          </nav>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Drawflow from 'drawflow'
import Swal from 'sweetalert2'
import { Modal } from 'bootstrap'

import { h, getCurrentInstance, render, readonly, onMounted, shallowRef, ref } from 'vue'

import NumberVue from './components/Number.vue';
import BinaryOperations from './components/BinaryOperations.vue';
import VariableVue from './components/Variable.vue';
import AssignVue from './components/Assign.vue';
import IfVue from './components/If.vue';
import ForVue from './components/For.vue';
import BlockVue from './components/Block.vue';

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
        expression: "Block",
        token: "Block",
        value: null,
      },
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
      },
      {
        expression: "If",
        token: "If",
      },
      {
        expression: "For",
        token: "For",
      },

    ]);

    var nodesTree = [];
    //var root = null;

    //variables en las que se almacenan las respuesta del servidor
    const pythonCode = ref("");
    const resultProgram = ref("");
    const listPrograms = ref({});
    //api url
    const apiUrl = ref("http://localhost:3000");
    var param=0;
    var listPagination = [];

    //funcion interpreter este sera el encargado de pasar del ast a sintaxis python
    const interpreter = () => {
      let idRoot = 0;
      nodesTree.forEach(node => {
        if (node.father == null) {
          idRoot = node.id
        }
      });
      console.log('a ver raiz',idRoot);
      pythonCode.value = visitNodePostOrden(idRoot);
      console.log('CODIGO OBTENIDO:', pythonCode.value);
    };

    const visitNodePostOrden = (idRoot) => {
      let value1 = '0';
      let value2 = '0';
      let code = '';

      let nodeRoot = getNodeFromNodesTree(idRoot);
      if (nodeRoot.token == 'Block') {
        console.log('entro',nodeRoot);
        value1='';
        nodeRoot.childs.forEach(child => {
          value1= value1+'\t'+visitNodePostOrden(child.idChild)+'\n'
          //value1 = value1+'\t'+child.idChild+'\n';
        });
      }else{ 
        if (nodeRoot.childLeft != null) {
          value1 = visitNodePostOrden(nodeRoot.childLeft);
        }
        if (nodeRoot.childRight != null) {
          value2 = visitNodePostOrden(nodeRoot.childRight);
        }
      }

      switch (nodeRoot.expression) {
        case 'BinOp':
          code = '(' + value1 + ' ' + nodeRoot.operador + ' ' + value2 + ')';
          break;
        case 'Assign':
          code = value1 + ' ' + nodeRoot.operador + ' ' + value2;
          break;
        case 'Declarative':
          code = nodeRoot.value;
          break;
        case 'Variable':
          code = nodeRoot.variable;
          break;
        case 'If':
          nodeRoot = editor.value.getNodeFromId(idRoot);
          code = 'if' + ' ' + nodeRoot.data.Expr1 + ' ' + nodeRoot.data.Operator + ' ' + nodeRoot.data.Expr2 + ' ' 
          + ':\n' + value1 + '\n' + 'else:\n' +value2 ;
          break;
        case 'For':
          nodeRoot = editor.value.getNodeFromId(idRoot);
          code = 'for i in range( ' + nodeRoot.data.Start + ' ,' + nodeRoot.data.Finish + '):\n\t' + value1;
          break;
        case 'Block':
          code = value1;
          break;
        default:
          break;
      }
      
      return code.toString();

    };

    //funcion para crear arbol
    const createTree = (idNode) => {
      addNode(idNode);
    };

    const addNode = (idNode) => {
      var node = editor.value.getNodeFromId(idNode);
      var op = '';
      lista.forEach(nodeType => {
        if (nodeType.token == node.name) {
          op = nodeType.operador;
        }
      });

      if (node.name == 'Add' || node.name == 'Sub' || node.name == 'Mul' || node.name == 'Div') {
        nodesTree.push({
          id: node.id,
          token: node.name,
          father: null,
          expression: 'BinOp',
          value: 0,
          operador: op,
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
              operador: op,
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
          case 'If':
            nodesTree.push({
              id: node.id,
              token: node.name,
              father: null,
              expression: "If",
              value: null,
              childLeft: null,
              childRight: null,
            });
            break;
          case 'For':
            nodesTree.push({
              id: node.id,
              token: node.name,
              father: null,
              expression: "For",
              value: null,
              childLeft: null,
              childRight: null,
            });
          break;
          case 'Block':
            nodesTree.push({
              id: node.id,
              token: node.name,
              father: null,
              expression: "Block",
              value: null,
              childs: [ ],
            });
          break;

          default:
            break;
        }

      }
    };
    //remove 
    const deleteNode = (id) => {
      removeDataNodeofOthersNodes(id,'delete');
    }

    const removeDataNodeofOthersNodes = (id,type) => {
      console.log('aja',id);
      let idNodeDelete = 0;
      nodesTree.forEach((node, index) => {
        if (node.father == id) {
          node.father = null;
        }
        
        if(node.expression=='Block'){ 
          node.childs.forEach((child,index)=> {
             if (child.idChild == id) {
                 node.childs.splice(index,1);
             }
          });

        }else {
            if (node.childLeft == id) {
              node.childLeft = null;
            } else if (node.childRight == id) {
              node.childRight = null;
            }
        }

        if (node.id == id) {
          idNodeDelete = index
          if (type === 'update') {
            node.father=null;
          }
        }
      });

      if (type==='delete') {
        nodesTree.splice(idNodeDelete, 1);
      }
      
    }

    const deleteConnection = (connection) => {
      console.log(connection);
      updateData(connection.output_id);
      removeDataNodeofOthersNodes(connection.output_id,'update');
    }

    const getNodeFromNodesTree = (id) => {
      let nodeSelect = {};
      nodesTree.forEach(node => {
        if (node.id == id) {
          nodeSelect = node;
        }
      });

      return nodeSelect;
    }


    //cargar conecciones en ambos nodos
    const updateNode = (connection) => {
      //output_id =  hijos , input_id =padre
      nodesTree.forEach((node) => {
        if (connection.output_id == node.id) {//agregar el padre al hijo
          let dataNodeChild = getDataFatherNode(node.id);
          editor.value.updateNodeDataFromId(node.id, dataNodeChild);
          node.father = connection.input_id;

        } else if (connection.input_id == node.id) { //agregar los hijos al padre
          if (node.token!='Block') {
            let dataNodeFather = getDataChildsNode(node.id, connection.output_id, connection.input_class);
            node.childLeft = dataNodeFather.ChildLeft;
            node.childRight = dataNodeFather.ChildRight;
            node.value = dataNodeFather.Value;
          } else {
            node.childs.push({
              inputId:connection.input_class,
              idChild:connection.output_id,
            });
          }
        }
      });

    };

    const getDataFatherNode = (idChild) => {
      const childSelect = editor.value.getNodeFromId(idChild);
      let dataNode = {};
      let name = childSelect.name;

      if (name == 'Add' || name == 'Sub' || name == 'Mul' || name == 'Div') {
        name = 'BinOp';
      }
      switch (name) {
        case 'BinOp':
          dataNode = {Value: childSelect.data.Value};
          break;
        case 'Number':
          dataNode = { Value: childSelect.data.Value };
          break;
        case 'Variable':
          dataNode = { Variable: childSelect.data.Variable, Value: childSelect.data.Value };
          break;
        case 'Assign':
          dataNode = {Value: childSelect.data.Value};
          break;
        case 'If':
          dataNode = {
            Operator: childSelect.data.Operator, Expr1: childSelect.data.Expr1, Expr2: childSelect.data.Expr2,
          };
          break;
        case 'For':
          dataNode = {
            Start: childSelect.data.Start, Finish: childSelect.data.Finish,
          };
          break;
        default:
          console.log('Tipo de nodo del hijo no permitido:', name);
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
        case 'If': {
          console.log('Padre es If');
          dataNode = getDataChildsNodeofCodeBlock(idFather, idChild, input);
          break;
        }
        case 'For':
          console.log('Padre es For');
          dataNode = getDataChildsNodeofCodeBlock(idFather, idChild, input);
          break;
        default:
          console.log('No permitido', name);
          break;
      }

      return dataNode;

    }

    //funciones para especificar como agregar los hijos segun el tipo de nodo Padre
    const getDataChildsNodeOfBinOp = (idFather, idChild, input) => {
      let Child = editor.value.getNodeFromId(idChild);
      let value = Child.data.Value;

      let dataFather = getNodeFromNodesTree(idFather);
      let brother = null;
      let left = null;
      let right = null;
      let num1= 0;
      let num2= 0;
      let result = 0;

      if (input == 'input_1') {
        left = idChild;
        num1 = value;
        right = dataFather.childRight;
       if (right != null) {
          brother = editor.value.getNodeFromId(dataFather.childRight);
          num2 = brother.data.Value;
        }
      } else if (input == 'input_2') {
        num2 = value;
        right = idChild;
        left = dataFather.childLeft;
        if (left != null) {
          brother = editor.value.getNodeFromId(dataFather.childLeft);
          num1 = brother.data.Value;
        }
      }

      result = getResultOperation(parseInt(num1), parseInt(num2), dataFather.token);
      let dataNode = {Father: dataFather.father,ChildLeft: left,ChildRight:right,Value: result};

      dispatch("setOperationAction", {
        id: idFather,
        value: { Number1: num1, Number2: num2, Result: result }
      });
     
      editor.value.updateNodeDataFromId(idFather, { Value: value });
      return dataNode;
    }

    const getValuesBinOp = (idFather, idChild, valueNew) => {
      const fatherSelect = getNodeFromNodesTree(idFather);
      let brother = null;

      let num1 = 0;
      let num2 = 0;
      let result = 0;

      console.log('get values bin op',fatherSelect);

      if (fatherSelect.childLeft == idChild) {
        num1 = valueNew;
        if (fatherSelect.childRight != null) {
          brother = editor.value.getNodeFromId(fatherSelect.childRight);
          num2 = brother.data.Value;
        }
      } else if (fatherSelect.childRight == idChild) {
        num2 = valueNew;
        if (fatherSelect.childLeft != null) {
          brother = editor.value.getNodeFromId(fatherSelect.childLeft);
          num1 = brother.data.Value;
        }
      }

      result = getResultOperation(parseInt(num1), parseInt(num2), fatherSelect.token);
      let dataNode = {
        Father: fatherSelect.father,
        ChildLeft: fatherSelect.childLeft,
        ChildRight: fatherSelect.childRight,
        Value: result
      };

      dispatch("setOperationAction", {
        id: idFather,
        value: { Number1: num1, Number2: num2, Result: result }
      });

      return dataNode;

    }

    const getDataChildsNodeOfAssign = (idNode, idChild, input) => {
      const nodeSelect = getNodeFromNodesTree(idNode);
      let child = editor.value.getNodeFromId(idChild);

      let dataNode = {};
      let child1 = null;
      let child2 = null;
      let value = 0;
      let variable = '';


      switch (input) {
        case 'input_1':
          child1 = idChild;
          child2 = nodeSelect.childRight;
          variable = child.data.Variable;
          if (child2 != null) {
            let brother = editor.value.getNodeFromId(child2);
            value = brother.data.Value;
          }
          break;
        case 'input_2':
          child2 = idChild;
          child1 = nodeSelect.childLeft;
          value = child.data.Value;
          if (child1 != null) {
            let brother = editor.value.getNodeFromId(child1);
            variable = brother.data.Variable;
          }
          break;

        default:
          break;
      }

      dataNode = {Father: nodeSelect.father,ChildLeft: child1,ChildRight: child2,Value:value};

      dispatch("setAssignAction", {
        id: idNode,
        value: { Variable: variable, Value: value }
      });
      
      editor.value.updateNodeDataFromId(idNode, { Variable: variable, Value: value });
      return dataNode;
    }

    const getDataChildsNodeofCodeBlock = (idNode, idChild, input) => {
          let father = getNodeFromNodesTree(idNode);
          let child1 = father.childLeft;
          let child2 = idChild;
          if (input == 'input_1') {
            child2 = father.childRight;
            child1 = idChild;
          }
          let dataNode = {
            Father: father.father, ChildLeft: child1, ChildRight: child2,
            Value:0
          };
          return dataNode; 
    }

    //actualizar data nodo BinOp/Assign cuando se actualiza la data del nodo Number
    const updateData = (id) => {
      const node = getNodeFromNodesTree(id);
      console.log('actualizar data del nodo', node);
      const idFather = node.father;
      updateNodesTree(id);

      if (idFather != null) {
        switch (node.token) {
          case 'Number':
            updateDataFatherOfNodeNumber(id);
            break;
          case 'Add':
            updateDataFatherOfNodeNumber(id);
            break;
          case 'Variable':
            updateDataFatherOfNodeVariable(id,idFather);
            break;
          default:
            break;
        }
      }
    }

    const updateNodesTree = (id) =>{
      const node = editor.value.getNodeFromId(id);
      nodesTree.forEach(nodeTree => {
        if (nodeTree.id == id) {
          switch (nodeTree.token) {
            case 'Number':
              if (!isNaN(parseInt(node.data.number))) {
                nodeTree.value = parseInt(node.data.number);
              }
              break;
            case 'Variable':
              if (!(node.data.variable === undefined)) {
                nodeTree.variable = node.data.variable;
              }
              break;
            default:
              break;
          }
        }
      });
    }

    const updateDataFatherOfNodeNumber = (id) => {
      const node = getNodeFromNodesTree(id);
      const idFather = node.father;
      const Father = editor.value.getNodeFromId(idFather);
      let name = Father.name;

      if (name == 'Add' || name == 'Sub' || name == 'Mul' || name == 'Div') {
        name = 'BinOp';
      }

      switch (name) {
        case 'Assign':
          updateNodeFatherAssign(id,idFather);
          break;
        case 'BinOp':
          updateNodeFatherBinOp(id,idFather);
          break;

        default:
          break;
      }

    }

    const updateNodeFatherBinOp = (id,idFather) => {
      const node = editor.value.getNodeFromId(id);
      let number = parseInt(node.data.number);

      if (isNaN(parseInt(node.data.number))) {
        number = 0;
      }
      console.log('prueba',number);

      let dataNode = getValuesBinOp(idFather, id, number);

      editor.value.updateNodeDataFromId(idFather, {Value:dataNode.Value});

      nodesTree.forEach(node => {
        if (node.id == idFather) {
          node.value = dataNode.Value;
        }
      });
      updateRecursiveArithOp(idFather, dataNode.Value);
    }

    const updateNodeFatherAssign = (id,idFather) => {
      const node = editor.value.getNodeFromId(id);
      const Father = getNodeFromNodesTree(idFather);

      let number = parseInt(node.data.number);
      if (isNaN(parseInt(node.data.number))) {
        number = 0;
      }

      let variable = '';
      if (Father.childLeft != null) {
        let childVar = editor.value.getNodeFromId(Father.childLeft);
        variable = childVar.data.Variable;
      }

      editor.value.updateNodeDataFromId(idFather, {Value: number});

      nodesTree.forEach(node => {
        if (node.id == idFather) {
          node.value = number;
        }
      });
      dispatch("setAssignAction", { id: idFather, value: { Variable: variable, Value: number } });
    }

    const updateDataFatherOfNodeVariable = (id,idFather) => {
      const node = editor.value.getNodeFromId(id);
      let variable = node.data.variable;
    
      const Father = editor.value.getNodeFromId(idFather);

      editor.value.updateNodeDataFromId(idFather, {Value: Father.data.Value});
      dispatch("setAssignAction", { id: idFather, value: { Variable: variable, Value: Father.data.Value } });
    }

    //recursividad nodo Operaciones Aritmeticas
    const updateRecursiveArithOp = (idFather, newValue) => {

      const nodeFather = getNodeFromNodesTree(idFather);
      const idNextFather = nodeFather.father;

      if (idNextFather != null) {
        const nextFather = getNodeFromNodesTree(idNextFather);

        if (nextFather.token == 'Add' || nextFather.token == 'Sub' || nextFather.token == 'Mul' || nextFather.token == 'Div') {

          let dataNode = getValuesBinOp(idNextFather, idFather, newValue);
          editor.value.updateNodeDataFromId(idNextFather, {Value:dataNode.Value});

          nodesTree.forEach(node => {
            if (node.id == idNextFather) {
              node.value = dataNode.Value;
            }
          });

          updateRecursiveArithOp(idNextFather, dataNode.Value);

        } else if (nextFather.token == 'Assign') {
          let number = parseInt(newValue);
          let variable = '';

          if (nextFather.childLeft != null) {
            let childVar = editor.value.getNodeFromId(nextFather.childLeft);
            variable = childVar.data.Variable;
          }

          editor.value.updateNodeDataFromId(idNextFather, { Value: number});

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
          editor.value.addNode(arithmeticOp, 2, 1, pos_x, pos_y, arithmeticOp, { Value: 0 }, arithmeticOp, 'vue');
          break;
        case 'Declarative':
          editor.value.addNode('Number', 0, 1, pos_x, pos_y, 'Number', { Value: 0 }, 'Number', 'vue');
          break;
        case 'Assign':
          editor.value.addNode('Assign', 2, 1, pos_x, pos_y, 'Assign', {  Value: 0 }, 'Assign', 'vue');
          break;
        case 'Variable':
          editor.value.addNode('Variable', 0, 1, pos_x, pos_y, 'Variable', { Variable: '', Value: 0 }, 'Variable', 'vue');
          break;
        case 'If':
          editor.value.addNode('If', 2, 1, pos_x, pos_y, 'If', { Operator: '<', Expr1: 0, Expr2: 0 }, 'If', 'vue');
          break;
        case 'For':
          editor.value.addNode('For', 1, 1, pos_x, pos_y, 'For', { Start: 0, Finish: 0 }, 'For', 'vue');
          break;
        case 'Block':
          editor.value.addNode('Block', 2, 1, pos_x, pos_y, 'Block', {  Value: 0 }, 'Block', 'vue');
          break;
        default:
          console.log('no se encontro');
          break;
      }

    };

    const generateCode = () => {
      var exportdata = editor.value.export();
      console.log('nodetree', nodesTree);
      console.log(Object.values(exportdata.drawflow.Home.data));
      interpreter();

      //Ventana Modal visualizacion code
      openModalCode();
    };

    const openModalCode = () => {
      Swal.fire({
        input: 'textarea',
        inputLabel: 'Sintaxis Python Code',
        inputValue: pythonCode.value,
        inputPlaceholder: 'Code here...',
        inputAttributes: {
          'aria-label': 'Code here',
          'disabled': true,
        },
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        },
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Save',
        denyButtonText: `Run`
      }).then((result) => {

        if (result.isConfirmed) {
          addProgram();
        } else if (result.isDenied) {
          runProgram();
          openModalRun();
        }
      })
    }

    const openModalRun = () => {
      Swal.fire({
        input: 'textarea',
        inputLabel: 'Shell',
        inputValue: resultProgram.value,
        inputPlaceholder: 'Type your message here...',
        inputAttributes: {
          'aria-label': 'Type your message here',
          'disabled': true,
        },
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        },
        showCancelButton: true,
        confirmButtonText: 'Back',
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          openModalCode();
        }
      })
    }

    const openModalListPrograms = async () =>{
      const myModal = new Modal(document.getElementById('exampleModal'),{})
      myModal.show();
      param=0;
      getPrograms();
    }
    const nextPage = async (id) =>{
      if (id===1) { 
        listPagination.forEach(page => {
          if (page.next == param) {
            param = page.previus;
          }
        });
        
      }else if (id===2){
        listPagination.forEach(page => {
          if (page.previus == param) {
            param = page.next;
          }
        });
      }
      getPrograms();
    }

    // funciones para verificar correctas conexiones entre nodos
    const evalutedConnection = (connection) => {
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
          if ((nameChild == 'Number' || nameChild == 'BinOp') && !taken) {
            valid = true
          }
          break;
        case 'Assign':
          taken = takenConnection(connection);
          if ((nameChild == 'Number' || nameChild == 'BinOp') && connection.input_class == 'input_2' && !taken) {
            valid = true;
          } else if (nameChild == 'Variable' && connection.input_class == 'input_1' && !taken) {
            valid = true;
          }
          break;
        case 'If':
          taken = takenConnection(connection);
          if ((nameChild != 'Variable') &&  !taken) {
            valid = true;
          } 
          break;
        case 'For':
          taken = takenConnection(connection);
          if (!taken && nameChild != 'Variable') {
            valid = true;
          }
          break;
        case 'Block':
          taken = takenConnectionBlock(connection);
          if (!taken && nameChild != 'Variable') {
            valid = true;
          }
          break;

        default:
          if (!taken) {
            valid = true;
          }
          break;
      }
      return valid;
    }

    const takenConnection = (connection) => {
      const father = getNodeFromNodesTree(connection.input_id);
      let taken = false;

      if (connection.input_class == 'input_1') {
        if (father.childLeft != null) {
          taken = true;
        }

      } else if (connection.input_class == 'input_2') {
        if (father.childRight != null) {
          taken = true;
        }
      }
      return taken;
    }
    const takenConnectionBlock = (connection) => {
      const father = getNodeFromNodesTree(connection.input_id);
      let taken = false;
 
      father.childs.forEach(child => {
        if (child.inputId == connection.input_class) {
          taken = true;
        }
      });
      return taken;
    }

    //request
    //GET
    const getPrograms = async () => {
      try {
        const requestOptions = {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        };
        const response = await fetch(
          apiUrl.value + "/page/"+param,//+"/programs"
          requestOptions
        );

        const json = await response.json();
        listPrograms.value = json.queryPrograms;//json.queryAllPrograms;

        listPrograms.value.forEach((program,index)=> {
           if (index == listPrograms.value.length-1) {
            if (listPagination.length>0) {
              let repetido = false;
              listPagination.forEach(page => {
                if (page.previus==param && page.next==program.uid) {
                  repetido = true;
                }
              });
              if (!repetido) {
                listPagination.push({previus:param,next:program.uid});
              }
            } else {
              listPagination.push({previus:param,next:program.uid});
            }
           }
        });
        //openModalListPrograms();
      } catch (err) {
        const myModal = Modal.getInstance(document.getElementById('exampleModal'));
        myModal.hide();

        Swal.fire({
                title: 'Error!',
                text: 'No se pudo acceder a la Base de Datos',
                icon: 'error',
                confirmButtonText: 'Ok'
          });
        console.log("get", err);
      }
    };
    //POST -- si funciona
    const addProgram = async () => {
      try {
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Code: [pythonCode.value] }),
        };
        console.log({ Code: [pythonCode.value] });
        await fetch(apiUrl.value + "/programs", requestOptions);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Program Saved",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (err) {
          Swal.fire({
                title: 'Error!',
                text: 'No se pudo guardar',
                icon: 'error',
                confirmButtonText: 'Ok'
          });
      }
    };

    //ejecutar codigo
    const runProgram = async () => {
      resultProgram.value = 'hola';
      try {
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Code: [pythonCode.value] }),
        };
        const response = await fetch(
          apiUrl.value + "/run/program",
          requestOptions
        );
        const data = await response.json();
        console.log(data);
        resultProgram.value = data;
      } catch (err) {
        console.log("run", err);
        Swal.fire({
                title: 'Error!',
                text: 'No se puede ejecutar el programa. Problemas de acceso.',
                icon: 'error',
                confirmButtonText: 'Ok'
        });
      }
    };

    //cargar listNodes de progrmas en el select
    const setCode = (uid) => {
          const myModal = Modal.getInstance(document.getElementById('exampleModal'));
          myModal.hide();

          try{ 
            const code = listPrograms.value.find((x) => x.uid == uid);
            //const code = listPrograms.value[index];
            console.log('codigo',code)
            pythonCode.value = code.Code[0];

            Swal.fire({
              title: `You selected program correctly!!`,
              showCancelButton: true,
              confirmButtonText: 'Code',
            }).then((result) => {
              if (result.isConfirmed) {
                openModalCode();
              }
            })
          } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'El programa seleccionado no se pudo encontrar',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
          } 
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

      editor.value.registerNode('Variable', VariableVue, {}, {}, 'vue');
      editor.value.registerNode('Assign', AssignVue, {}, {}, 'vue');
      editor.value.registerNode('If', IfVue, {}, {}, 'vue');
      editor.value.registerNode('For', ForVue, {}, {}, 'vue');
      editor.value.registerNode('Block', BlockVue, {}, {}, 'vue');

      // Events!
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
        } else {
          editor.value.removeSingleConnection(connection.output_id, connection.input_id, connection.output_class, connection.input_class);
          Swal.fire({
            title: 'Warning!',
            text: 'Conexion no valida',
            icon: 'warning',
            confirmButtonText: 'Ok'
          });
        }
      })

      editor.value.on('nodeDataChanged', function (id) {
        //actualizar datos heredados a otros nodos
        console.log('id del nodo que se actualizo', id);
        updateData(id);
      })

      editor.value.on('connectionRemoved', function (connection) {
        console.log("connection eliminada ", connection);
        deleteConnection(connection);
      })

      editor.value.on('nodeRemoved', function (id) {
        console.log("Node Removed " + id);
        deleteNode(id);
      })

    });

    return {nextPage, openModalListPrograms, getPrograms ,pythonCode, evalutedConnection, updateRecursiveArithOp, getResultOperation, setNodeType, lista, setCode, listPrograms, drag, drop, enableDrop, generateCode, interpreter, createTree, addNode, updateNode, updateData };

  }


}
</script>

<style>

tbody tr:hover{ 
  cursor: pointer;
  background: rgba(223, 237, 244);
  color: rgba(5, 44, 64, 1);
  border: 1px solid rgba(223, 237, 244);
  -webkit-box-shadow: 0px 1px 8px 1px rgba(78, 169, 255, 1);
  box-shadow:0px 1px 8px 1px rgba(78, 169, 255, 1);
}

.wrapper {
    width: 100%;
    height: calc(100vh - 250px);
}

.barra{
  overflow: auto !important;
  height: 100%;
  border-right: 1px solid #e2e3e5;
}

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
  background-color: #d9dde0;
}

.swal2-textarea {
  height: 6.75em;
  padding: .75em;
  background-color: #282c34;
}

</style>
