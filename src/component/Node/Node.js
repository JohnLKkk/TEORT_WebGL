import Component from "../Component.js";
import Matrix44 from "../Math3d/Matrix44.js";
import Vector3 from "../Math3d/Vector3.js";
import Quaternion from "../Math3d/Quaternion.js";

/**
 * 节点组件表示场景的一个关节，用于对场景进行场景图管理。<br/>
 * @author Kkk
 */
export default class Node extends Component{
    getType() {
        return 'Node';
    }

    constructor(owner, cfg) {
        super(owner, cfg);
        this._m_LocalMatrix = new Matrix44();
        this._m_WorldMatrix = new Matrix44();
        this._m_Parent = null;
        this._m_Children = [];
        this._m_ChildrenIDs = {};

        // 缩放
        this._m_LocalScale = new Vector3(1, 1, 1);
        // 旋转
        this._m_LocalRotation = new Quaternion();
        // 平移
        this._m_LocalTranslation = new Vector3();

        // 两种可能,本地矩阵发生变化时,需要更新本地矩阵,然后更新世界矩阵
        // 本地矩阵没有发生变化时,只需要更新世界矩阵
        this._m_UpdateLocalMatrix = false;
        this._m_UpdateWorldMatrix = false;
    }

    /**
     * 设置局部缩放。<br/>
     * @param {Vector3}[scale]
     */
    setLocalScale(scale){
        this._m_LocalScale.setTo(scale);
        this._updateLocalMatrix();
    }

    /**
     * 设置缩放。<br/>
     * @param {Number}[x]
     * @param {Number}[y]
     * @param {Number}[z]
     */
    setLocalScaleXYZ(x, y, z){
        this._m_LocalScale.setToInXYZ(x, y, z);
        this._updateLocalMatrix();
    }

    /**
     * 返回缩放。<br/>
     * @returns {Vector3}
     */
    getLocalScale(){
        return this._m_LocalScale;
    }

    /**
     * 设置旋转。<br/>
     * @param {Quaternion}[rotation]
     */
    setLocalRotation(rotation){
        this._m_LocalRotation.setTo(rotation);
        this._updateLocalMatrix();
    }

    /**
     * 设置旋转欧拉角。<br/>
     * @param {Number}[x 轴欧拉角]
     * @param {Number}[y 轴欧拉角]
     * @param {Number}[z 轴欧拉角]
     */
    setLocalRotationFromEuler(x, y, z){
        this._m_LocalRotation.fromEuler(x, y, z);
        this._updateLocalMatrix();
    }

    /**
     * 返回旋转。<br/>
     * @returns {Quaternion}
     */
    getLocalRotation(){
        return this._m_LocalRotation;
    }

    /**
     * 设置平移。<br/>
     * @param {Vector3}[translation]
     */
    setLocalTranslation(translation){
        this._m_LocalTranslation.setTo(translation);
        this._updateLocalMatrix();
    }

    /**
     * 设置平移。<br/>
     * @param {Number}[x]
     * @param {Number}[y]
     * @param {Number}[z]
     */
    setLocalTranslationXYZ(x, y, z){
        this._m_LocalTranslation.setToInXYZ(x, y, z);
        this._updateLocalMatrix();
    }

    /**
     * 返回平移。<br/>
     * @returns {Vector3}
     */
    getLocalTranslation(){
        return this._m_LocalTranslation;
    }

    /**
     * 更新本地矩阵。<br/>
     * @private
     */
    _updateLocalMatrix(){
        this._m_UpdateLocalMatrix = true;
        this._updateWorldMatrix();
    }

    /**
     * 更新世界矩阵。<br/>
     * @private
     */
    _updateWorldMatrix(){
        this._m_UpdateWorldMatrix = true;
        // 通知所有子节点更新世界矩阵
        this._m_Children.forEach(children=>{
            children._updateWorldMatrix();
        });
    }

    /**
     * 返回本地矩阵。<br/>
     * @returns {Matrix44}
     */
    getLocalMatrix(){
        if(this._m_UpdateLocalMatrix){
            // 更新本地矩阵
            Matrix44.composeMat4(this._m_LocalTranslation, this._m_LocalRotation, this._m_LocalScale, this._m_LocalMatrix);
            this._m_UpdateLocalMatrix = false;
        }
        return this._m_LocalMatrix;
    }

    /**
     * 设置本地矩阵。<br/>
     * @param {Matrix44}[matrix]
     */
    setLocalMatrix(matrix){
        // 覆盖矩阵
        this._m_LocalMatrix.set(matrix);
        this._updateLocalMatrix();
        // updateLocalMatrix设置UpdateLocalMatrix为true,但是我们手动复制了matrix到localMatrix中,所以可以在updateLocalMatrix()调用后手动设置UpdateLocalMatrix为false减少计算量
        this._m_UpdateLocalMatrix = false;
        // 从矩阵提取translation,rotation,scale
        Matrix44.decomposeMat4(matrix, this._m_LocalTranslation, this._m_LocalRotation, this._m_LocalScale);
    }

    /**
     * 返回世界矩阵。<br/>
     * @returns {Matrix44}
     */
    getWorldMatrix(){
        if(this._m_UpdateWorldMatrix){
            // 更新世界矩阵
            this._buildWorldMatrix();
        }
        return this._m_WorldMatrix;
    }

    /**
     * 构建世界矩阵。<br/>
     * @private
     */
    _buildWorldMatrix(){
        if(this._m_UpdateWorldMatrix){
            // 1.执行本地矩阵变换
            let localMatrix = this.getLocalMatrix();
            // 2.执行世界变换
            if(!this._m_Parent){
                // 复制,不要使用引用,因为Node可实时调整父节点
                this._m_WorldMatrix.set(this._m_LocalMatrix);
            }
            else{
                // 执行世界变换
                // 获取父变换矩阵,只要一个父节点获取了父节点变换矩阵,那么父节点变换矩阵就已经被计算了(即只会计算一次)
                // 由于渲染不会按照场景图进行渲染,而是按照排序算法，遮挡算法进行处理，所以更新节点成本很低(每个需要更新的节点只会计算一次)
                // 合并矩阵
                Matrix44.multiplyMM(this._m_WorldMatrix, 0, this._m_LocalMatrix, 0, this._m_Parent.getWorldMatrix(), 0);
            }
            // ...
            this._m_UpdateWorldMatrix = false;
        }
    }

    /**
     * 添加一个子节点。<br/>
     * @param {Node}[children]
     */
    addChildren(children){
        if(children instanceof Node){
            // 检测children组件是否已经载入scene组件列表
            // 检测children是否已经添加过
            if(children._m_Parent == null && !this._m_ChildrenIDs[children.getId()]){
                this._m_ChildrenIDs[children.getId()] = children;
                this._m_Children.push(children);
                children._m_Parent = this;
            }
        }
        else{
            console.error("children不是一个合法的Node!");
        }
    }

    /**
     * 移除一个子节点。<br/>
     * @param {Node}[children]
     */
    removeChildren(children){
        if(children instanceof Node){
            if(this._m_ChildrenIDs[children.getId()]){
                this._m_ChildrenIDs[children.getId()] = null;
                this._m_Children.remove(children);
                children._m_Parent = null;
            }
        }
    }

}
