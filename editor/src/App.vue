<template>

  <div id="app">
    <div class="container editor-body">
      <div class="row">
        <div class="col-3">
          <div class="mb-2">
            <h3 class="title-editor">Principal</h3>
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
            <h3 class="mt-3 title-editor">Nodes</h3>
            <hr />
          </div>
          <div class="wrapper">
            <ul class="list-group navbar-editor">
              <li class="list-group-item list-group-item-secondary" v-for="(n, id) in listNodes" :key="id"
                draggable="true" :data-node="n.token" @dragstart="drag($event)" @dragover="enableDrop($event)">
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
            <div class="bar-zoom">
              <div type="button" class="btn btn-primary mx-1" v-on:click="zoom_out()">
                <font-awesome-icon icon="fa-solid fa-magnifying-glass-minus" size="lg" />
              </div>
              <div type="button" class="btn btn-primary mx-1" v-on:click="zoom_reset()">
                <font-awesome-icon icon="fa-solid fa-magnifying-glass" size="lg" />
              </div>
              <div type="button" class="btn btn-primary mx-1" v-on:click="zoom_in()">
                <font-awesome-icon icon="fa-solid fa-magnifying-glass-plus" size="lg" />
              </div>
            </div>
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
              <tr @click="setCode(item.uid)" v-for="(item, index) in listPrograms" :key="index">
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

import { h, getCurrentInstance, render, onMounted, shallowRef, ref} from 'vue'

import NumberVue from './components/Number.vue';
import BinaryOperations from './components/BinaryOperations.vue';
import VariableVue from './components/Variable.vue';
import AssignVue from './components/Assign.vue';
import IfVue from './components/If.vue';
import ForVue from './components/For.vue';
import BlockVue from './components/Block.vue';
import PrintVue from './components/Print.vue';

//vuex
import { useStore } from "vuex";

import { listNodes,listNodeEditor } from './util';

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

    //variables en las que se almacenan las respuesta del servidor
    var nodesTree = [];

    const pythonCode = ref("");
    const resultProgram = ref("");
    const listPrograms = ref({});
    
    var param = 0;
    var listPagination = [];

    //funciones para agregar a drawflow
    const drag = (ev) => {
      ev.dataTransfer.setData("node", ev.target.getAttribute("data-node"));
    };

    const drop = (ev) => {
      if (ev.type === "drop") {
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
      listNodeEditor.forEach(node => {
        if (node.token == token) {
          editor.value.addNode(node.token,node.inputs, 1, pos_x, pos_y, node.token,node.value, node.token, 'vue');
        }
      });
    };

    //funcion interpreter este sera el encargado de pasar del ast a sintaxis python
    const interpreter = () => {
      let idRoot = 0;
      let nodesWithoutFather = 0;
      nodesTree.forEach(node => {
        if (node.father == null) {
          idRoot = node.id;
          nodesWithoutFather = nodesWithoutFather +1;
        }
      });
      console.log("nodos huerfanos",nodesWithoutFather);
      nodesWithoutFather===1 ? (
        pythonCode.value = visitNodesTree(idRoot),
        openModalCode()
      ) : (
        openModalPersonalize("Info!!!","Don't exist a root node",'info',true,0)
      ); 
    };

    const openModalPersonalize = (title,text,icon,show) =>{
      Swal.fire({
                title: title,
                text: text,
                icon: icon,
                showConfirmButton: show,
                timer:0,
        })
    }
    
    /*Visit each node */
    const visitNodesTree = (idRoot) => {
      let value1 = '0';
      let value2 = '0';

      let nodeRoot = getNodeFromNodesTree(idRoot);

      if (nodeRoot.token == 'Block') {
        value1='';
        nodeRoot.childs.forEach(child => {
          value1= value1+'\t'+visitNodesTree(child.idChild)+'\n'
        });
        return codeAccordingTypeNode(value1,value2,idRoot); 
      }
      

      if (nodeRoot.childLeft != null) {
        value1 = visitNodesTree(nodeRoot.childLeft);
      }
      if (nodeRoot.childRight != null) {
        value2 = visitNodesTree(nodeRoot.childRight);
      }
      return codeAccordingTypeNode(value1,value2,idRoot); 

    };

    const codeAccordingTypeNode = (value1,value2,idRoot) =>{
      let nodeRoot = getNodeFromNodesTree(idRoot);
      let code = "";

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
          if (value1 == '') {
            code ='\t'+'0';
          }else{
            code = value1;
          }
          break;
        case 'Print':
          nodeRoot = editor.value.getNodeFromId(idRoot);
          code = 'print("'+nodeRoot.data.Value+'")';
          break;
        default:
          break;
      }
      return code.toString();
    }

    //Add node to nodesTree
    const addNode = (idNode) => {
      var nodeEditor = editor.value.getNodeFromId(idNode);
      var newNode = null;

      listNodes.forEach(node => {
        if (node.token == nodeEditor.name) {
          newNode = JSON.parse(JSON.stringify(node));
          newNode.id = idNode;
          nodesTree.push(newNode);
        }
      });
    };

    /*Remove node of nodesTree */
    const deleteNode = (id) => {
      removeNode(id);
    }

    /*Remove data connection of linked nodes */
    const deleteConnection = (connection) => {
      updateData(connection.output_id);
      removeDataNodeofOthersNodes(connection.output_id,connection.input_id);

    }

    /*Remove data of linked nodes*/
    const removeDataNodeofOthersNodes = (idChild,idFather) => {
      nodesTree.forEach((node) => {
        if (node.id == idChild) {
          node.father = null;
        }
      });

      nodesTree.forEach(node => {
        if(node.id == idFather){
          if(node.expression=='Block'){ 
            node.childs.forEach((child,index)=> {
              if (child.idChild == idChild) {
                  node.childs.splice(index,1);
              }
            });
          }else {
              if (node.childLeft == idChild) {
                node.childLeft = null;
              } else if (node.childRight == idChild) {
                node.childRight = null;
              }
          }
        }
      });  
    }

    const removeNode = (id) =>{
      let idNode = null;
      nodesTree.forEach((node,index) => {
        if (node.id == id) {
          idNode = index; 
        }
      });

      if (idNode!=null) {
        nodesTree.splice(idNode, 1);
      }
    }
    
    /*Get node from nodesTree */
    const getNodeFromNodesTree = (id) => {
      let nodeSelect = {};
      nodesTree.forEach(node => {
        if (node.id == id) {
          nodeSelect = node;
        }
      });

      return nodeSelect;
    }


    /*Load data connection in linked nodes */
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
    
    /*Load data connection in father node */
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
        case 'Print':
          dataNode = {Value: childSelect.data.Value};
          break;
        default:
          console.log('Tipo de nodo del hijo no permitido:', name);
          break;
      }

      return dataNode;

    }

    /*Load data connection in child node */
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

    /*Get id child and values of Binary Operation Node*/
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
    
    /*Get updated values of Binary Operation Node*/
    const getValuesBinOp = (idFather, idChild, valueNew) => {
      const fatherSelect = getNodeFromNodesTree(idFather);
      let brother = null;

      let num1 = 0;
      let num2 = 0;
      let result = 0;

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
      let dataNode = {Value: result};

      dispatch("setOperationAction", {
        id: idFather,
        value: { Number1: num1, Number2: num2, Result: result }
      });

      return dataNode;

    }
    
    /*Get id child and values of Assign Node*/
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
    
    /*Get id child of Others Node*/
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

    /*Update data of ascending nodes */
    const updateData = (id) => {
      const node = getNodeFromNodesTree(id);
      const idFather = node.father;

      const nodeEditor = editor.value.getNodeFromId(id);
      updateNodesTree(id);

      if (idFather != null) {
        const father = editor.value.getNodeFromId(idFather);
        if (node.expression== 'Variable' ) {
          updateDataFatherOfNodeVariable(nodeEditor.data.variable,father.data.value,idFather);
        } else if (node.expression == 'Declarative'|| node.expression == 'BinOp' ){
          updateDataFatherOfNodeNumber(id,idFather,nodeEditor.data.number);
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

    const updateDataFatherOfNodeNumber = (id,idFather,number) => {
      isNaN(parseInt(number))? number = 0: number = parseInt(number)
      const father = getNodeFromNodesTree(idFather);
      const typeNode = father.expression;

      switch (typeNode) {
        case 'Assign':
          updateNodeFatherAssign(idFather,number);
          break;
        case 'BinOp':
          updateNodeFatherBinOp(id,idFather,number);
          break;
        default:
          break;
      }

    }

    const updateNodeFatherBinOp = (id,idFather,number) => {
      let dataNode = getValuesBinOp(idFather, id, number);
      editor.value.updateNodeDataFromId(idFather, {Value:dataNode.Value});

      nodesTree.forEach(node => {
        if (node.id == idFather) {
          node.value = dataNode.Value;
        }
      });
      updateRecursiveArithOp(idFather,dataNode.Value);
    }

    const updateNodeFatherAssign = (idFather,number) => {
      const Father = getNodeFromNodesTree(idFather);

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

    /*Update values of Assign Node in forntend*/
    const updateDataFatherOfNodeVariable = (variable,value,idFather) => {
      dispatch("setAssignAction", { id: idFather, value: { Variable: variable, Value: value } });
    }

    //recursividad nodo Operaciones Aritmeticas
    const updateRecursiveArithOp = (idFather,newValue) => {
      const nodeFather = getNodeFromNodesTree(idFather);
      const idNextFather = nodeFather.father;

      if (idNextFather != null) {
        const nextFather = getNodeFromNodesTree(idNextFather);
        if (nextFather.expression == 'BinOp') {
          updateNodeFatherBinOp (idFather,idNextFather,newValue);
        } else if (nextFather.token == 'Assign') {
          let number = parseInt(newValue);
          updateNodeFatherAssign (idNextFather,number);
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

    const generateCode = () => {
      var exportdata = editor.value.export();
      console.log('nodetree', nodesTree);
      console.log(Object.values(exportdata.drawflow.Home.data));
      interpreter();
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
          //openModalRun();
        }
      })
    }

    const openModalRun = async () => {
      Swal.fire({
        input: 'textarea',
        inputLabel: 'Shell',
        inputValue: resultProgram.value,
        inputPlaceholder: 'Code here...',
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
      param=0;
      getPrograms();
      const myModal = new Modal(document.getElementById('exampleModal'),{})
      myModal.show();
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
          if ((nameChild == 'Block') &&  !taken) {
            valid = true;
          } 
          break;
        case 'For':
          taken = takenConnection(connection);
          if (!taken && nameChild == 'Block') {
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
          process.env.VUE_APP_ENDPOINT_PAGE + "/"+param,//+"/programs"
          requestOptions
        );
        if (response.status != 200) {
          openModalPersonalize("Error!!!","Data don't found",'error',false,1500)
        }else{
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
        }
      } catch (err) {
        const myModal = Modal.getInstance(document.getElementById('exampleModal'));
        myModal.hide();
        openModalPersonalize("Error!!!","Server connection refused",'error',true,0)
      }
    };
    //POST -- si funciona
    const addProgram = async () => {
      try {
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: [pythonCode.value] }),
        };
        const response = await fetch(process.env.VUE_APP_ENDPOINT_PROGRAMS, requestOptions);
        
        response.status != 201 ? 
          openModalPersonalize("Error!!!","Could not save code.ERROR:"+response.status,'error',false,1500)
        :  
          openModalPersonalize("Success!!!","Code Saved!",'success',false,1500)

      } catch (err) {
          openModalPersonalize("Error!!!","Server conecction refused",'error',false,1500)
      }
    };

    /*Asynchronous requests to the server to execute program */
    const runProgram = async () => {
      try {
        console.log('run',pythonCode.value);
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: [pythonCode.value] }),
        };
        const response = await fetch(
          process.env.VUE_APP_ENDPOINT_RUN,
          requestOptions
        );
        const data = await response.json();

        response.status != 200?( 
          openModalPersonalize("Error!!!","Could not execute code.ERROR:"+response.status,'error',false,1500)
        ):(
          resultProgram.value = data,
          openModalRun()
        );
      } catch (err) {
        openModalPersonalize("Error!!!","Server connection refused",'error',false,1500);
      }
    };

    /*Get a program from list of programs*/
    const setCode = (uid) => {
          const myModal = Modal.getInstance(document.getElementById('exampleModal'));
          myModal.hide();

          try{ 
            const code = listPrograms.value.find((x) => x.uid == uid);
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
            openModalPersonalize("Error!!!","Program not Found",'error',false,1500)
          } 
    };
    
    /*Functions for zoom control*/
    const zoom_out = () => {
      editor.value.zoom_out();
    }
    const zoom_in = () => {
      editor.value.zoom_in();
    }
    const zoom_reset = () => {
      editor.value.zoom_reset();
    }

    onMounted(() => {
      var id = document.getElementById("drawflow");
      // Pass render Vue 3 Instance
      editor.value = new Drawflow(id, Vue, internalInstance.appContext.app._context);
      editor.value.start();

      //components
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
      editor.value.registerNode('Print', PrintVue, {}, {}, 'vue');

      // Events
      editor.value.on('nodeCreated', function (id) {
        console.log("Node created " + id);
        addNode(id); 
      })

      /*When create a conecction update nodes data */
      editor.value.on('connectionCreated', function (connection) {
        let connectionValid = evalutedConnection(connection);
        if (connectionValid) {
          updateNode(connection);
        } else {
          editor.value.removeSingleConnection(connection.output_id, connection.input_id, connection.output_class, connection.input_class);
          openModalPersonalize("Warning!!!","Invalid node connection",'warning',true,0)
        }
      })

      /*Update data of ascending nodes */
      editor.value.on('nodeDataChanged', function (id) {
        console.log('id del nodo que se actualizo', id);
        updateData(id);
      })
      
      /*Update data of linked nodes and remove of nodesTree*/
      editor.value.on('connectionRemoved', function (connection) {
        console.log("connection eliminada ", connection);
        deleteConnection(connection);
      })

      editor.value.on('nodeRemoved', function (id) {
        console.log("Node Removed " + id);
        deleteNode(id);
      })

    });

    return {zoom_reset,zoom_out,zoom_in,nextPage, openModalListPrograms, getPrograms ,pythonCode, evalutedConnection, updateRecursiveArithOp, getResultOperation, setNodeType, listNodes, setCode, listPrograms, drag, drop, enableDrop, generateCode, interpreter, addNode, updateNode, updateData };

  }


}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');

.title-editor {
  color: rgb(169, 112, 177);
  font-size: 2.5em;
  font-family: 'roboto', sans-serif;
  text-align: center;
}

.bar-zoom {
  float: right;
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  font-size: 24px;
  color: white;
  padding: 5px 10px;
  background-color: rgb(169, 112, 177);
  border-radius: 5px;
  border: 1px none rgb(169, 112, 177);
  box-shadow: 0 0 30px 0 rgb(0 0 0 / 20%), 0 5px 5px 0 rgb(0 0 0 / 24%);
  z-index: 5;
}

tbody tr:hover {
  cursor: pointer;
  background: rgba(223, 237, 244);
  color: rgba(5, 44, 64, 1);
  border: 1px solid rgba(223, 237, 244);
  -webkit-box-shadow: 0px 1px 8px 1px rgba(78, 169, 255, 1);
  box-shadow: 0px 1px 8px 1px rgba(78, 169, 255, 1);
}

.wrapper {
  width: 100%;
  height: calc(100vh - 250px);
}

.navbar-editor {
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

.editor-body {
  border-radius: 10px;
  border: 1px none rgb(169, 112, 177);
  box-shadow: 0 0 30px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);
  margin: 0px;
  padding: 2%;
  background-color: #d9dde0;
}

.swal2-textarea {
  height: 12.75em;
  padding: .75em;
  background-color: #282c34;
  color: #cfd0d1;
}
</style>
