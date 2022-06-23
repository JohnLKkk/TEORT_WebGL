/**
 * Mesh创建工具类，提供一些调试需要的Mesh创建。<br/>
 * 诸如WireFrustum，Torus等。<br/>
 * @author Kkk
 * @date 2021年2月22日17点27分
 */
import Vector2 from "../Math3d/Vector2.js";
import Mesh from "../WebGL/Mesh.js";
import Vector3 from "../Math3d/Vector3.js";
import Node from "../Node/Node.js";
import Tools from "./Tools.js";
import Sphere from "../Node/Shape/Sphere.js";
import Material from "../Material/Material.js";
import Vec4Vars from "../WebGL/Vars/Vec4Vars.js";
import MaterialDef from "../Material/MaterialDef.js";
import Internal from "../Render/Internal.js";
import Geometry from "../Node/Geometry.js";
import MoreMath from "../Math3d/MoreMath.js";

export default class MeshFactor {
    static count = 0;
    constructor() {

    }

    static nextId(){
        return --MeshFactor.count;
    }

    static pushVec3ToArray(array, vec3){
        array.push(vec3._m_X);
        array.push(vec3._m_Y);
        array.push(vec3._m_Z);
    }
    static createDebugProbes(scene, probeLocations, matDef, giProbes){
        let giProbesNode = new Node(scene, {id:'giProbesNode_' + Tools.nextId()});
        // 创建探针,后续改为instanceDrawing
        if(!matDef){
            matDef = MaterialDef.parse(Internal.S_PROBE_INFO_DEF_DATA);
        }
        // probeGroups
        let positions = [];
        let indices = [];
        for(let i = 0;i < probeLocations.length;i++){
            // positions.push(probeLocations[i]._m_X);
            // positions.push(probeLocations[i]._m_Y);
            // positions.push(probeLocations[i]._m_Z);
            // indices.push(i);

            let mat = new Material(scene, {id:'probe_mat_' + Tools.nextId(), materialDef:matDef});
            // mat.setParam('color', new Vec4Vars().valueFromXYZW(0.7, 0.7, 0.7, 1.0));
            mat.setParam('probeData', giProbes.getShCoeffsIndex(i));
            let probe = new Sphere(giProbesNode, {id:'probe_' + Tools.nextId(), radius:0.15, widthSegments: 5, heightSegments: 5});
            probe.setLocalScaleXYZ(0.25, 0.25, 0.25);
            probe.receiveShadow(false);
            probe.castShadow(false);
            probe.setMaterial(mat);
            probe.setLocalTranslation(probeLocations[i]);
            giProbesNode.addChildren(probe);
        }
        let comp = (v1, v2)=>{
            return (v1.distance(v2) <= 0.1);
        };
        let findProbe = (probeLocation)=>{
            for(let i = 0;i < probeLocations.length;i++){
                if(comp(probeLocation, probeLocations[i])){
                    return i;
                }
            }
            return 0;
        };
        let v = new Vector3();
        let probeStep = giProbes.getProbeStep();
        let n = 0, n2 = 0;
        for(let i = 0;i < probeLocations.length;i++){
            // 查找周围18个probe

            v.setToInXYZ(probeLocations[i]._m_X + probeStep._m_X, probeLocations[i]._m_Y, probeLocations[i]._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 1
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X, probeLocations[i]._m_Y, probeLocations[i]._m_Z + probeStep._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 2
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X, probeLocations[i]._m_Y + probeStep._m_Y, probeLocations[i]._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 3
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X + probeStep._m_X, probeLocations[i]._m_Y + probeStep._m_Y, probeLocations[i]._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 4
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X, probeLocations[i]._m_Y + probeStep._m_Y, probeLocations[i]._m_Z + probeStep._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 5
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X + probeStep._m_X, probeLocations[i]._m_Y + probeStep._m_Y, probeLocations[i]._m_Z + probeStep._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 6
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X - probeStep._m_X, probeLocations[i]._m_Y - probeStep._m_Y, probeLocations[i]._m_Z - probeStep._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 7
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X + probeStep._m_X, probeLocations[i]._m_Y - probeStep._m_Y, probeLocations[i]._m_Z + probeStep._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 8
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X + probeStep._m_X, probeLocations[i]._m_Y - probeStep._m_Y, probeLocations[i]._m_Z - probeStep._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 9
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X - probeStep._m_X, probeLocations[i]._m_Y, probeLocations[i]._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 10
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X, probeLocations[i]._m_Y - probeStep._m_Y, probeLocations[i]._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 11
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X, probeLocations[i]._m_Y, probeLocations[i]._m_Z - probeStep._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 12
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X - probeStep._m_X, probeLocations[i]._m_Y, probeLocations[i]._m_Z - probeStep._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 12
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X, probeLocations[i]._m_Y - probeStep._m_Y, probeLocations[i]._m_Z - probeStep._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 12
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X - probeStep._m_X, probeLocations[i]._m_Y - probeStep._m_Y, probeLocations[i]._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 15
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X + probeStep._m_X, probeLocations[i]._m_Y, probeLocations[i]._m_Z - probeStep._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 16
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
            v.setToInXYZ(probeLocations[i]._m_X - probeStep._m_X, probeLocations[i]._m_Y, probeLocations[i]._m_Z + probeStep._m_Z);
            n = findProbe(v);
            if(n){
                // 0
                positions.push(probeLocations[i]._m_X);
                positions.push(probeLocations[i]._m_Y);
                positions.push(probeLocations[i]._m_Z);
                // 17
                positions.push(probeLocations[n]._m_X);
                positions.push(probeLocations[n]._m_Y);
                positions.push(probeLocations[n]._m_Z);
                indices.push(n2++);
                indices.push(n2++);
            }
        }
        let mesh = new Mesh();
        mesh.setData(Mesh.S_POSITIONS, positions);
        mesh.setData(Mesh.S_INDICES, indices);
        mesh.setPrimitive(Mesh.S_PRIMITIVE_LINES);
        let probeGroups = new Geometry(scene, {id:'probeGroups_' + Tools.nextId()});
        probeGroups.setMesh(mesh);
        probeGroups.setMaterial(new Material(scene, {id:'probe_groups_mat_' + Tools.nextId(), materialDef:MaterialDef.parse(Internal.S_COLOR_DEF_DATA)}));
        probeGroups.updateBound();
        probeGroups.getMaterial().setParam('color', new Vec4Vars().valueFromXYZW(1, 204/255.0, 0, 1));
        probeGroups.receiveShadow(false);
        probeGroups.castShadow(false);
        giProbesNode.addChildren(probeGroups);
        return giProbesNode;
    }

    /**
     * 创建圆形几何。<br/>
     * @param {Number}[texSize 分块大小]
     * @param {Boolean}[dashed 虚线]
     * @return {Mesh}
     */
    static createRoundMesh(texSize, dashed){
        let mesh = new Mesh();
        let positions = [];
        let indices = [];
        let t = 0, u = 0;
        const size = 360;
        const tw = texSize;
        for(let i = 0;i < 360;i+=tw){
            positions[t] = Math.sin(MoreMath.toRadians(i));
            positions[t + 1] = 0;
            positions[t + 2] = Math.cos(MoreMath.toRadians(i));
            t+=3;
            indices[u] = u;
            u++;
        }
        mesh.setData(Mesh.S_POSITIONS, positions);
        mesh.setData(Mesh.S_INDICES, indices);
        if(dashed)
            mesh.setPrimitive(Mesh.S_PRIMITIVE_LINES);
        else
            mesh.setPrimitive(Mesh.S_PRIMITIVE_LINE_LOOP);
        return mesh;
    }

    /**
     * 创建Probe数据。<br/>
     * @return {Mesh}
     */
    static createProbeMesh(){
        let mesh = new Mesh();
        // 对于不需要旋转的Sky,我们仅需要positions和indices数据
        mesh.setData(Mesh.S_POSITIONS, [3.4201992, 0.0, -9.396927, 2.7669992, 2.0103426, -9.396927, 1.0568995, 3.2528028, -9.396927, -1.0568998, 3.2528026, -9.396927, -2.7669995, 2.0103424, -9.396927, -3.4201992, -2.9900332E-7, -9.396927, -2.766999, -2.010343, -9.396927, -1.0569, -3.2528026, -9.396927, 1.0569001, -3.2528026, -9.396927, 2.7670002, -2.0103416, -9.396927, 3.4201992, 0.0, -9.396927, 6.427875, 0.0, -7.660445, 5.20026, 3.7782102, -7.660445, 1.9863225, 6.1132727, -7.660445, -1.9863229, 6.113272, -7.660445, -5.2002606, 3.7782097, -7.660445, -6.427875, -5.6194267E-7, -7.660445, -5.2002597, -3.7782109, -7.660445, -1.9863232, -6.113272, -7.660445, 1.9863235, -6.113272, -7.660445, 5.2002616, -3.7782083, -7.660445, 6.427875, 0.0, -7.660445, 8.6602545, 0.0, -4.9999995, 7.0062933, 5.0903697, -4.9999995, 2.6761656, 8.236392, -4.9999995, -2.676166, 8.236391, -4.9999995, -7.006294, 5.090369, -4.9999995, -8.6602545, -7.5710346E-7, -4.9999995, -7.006293, -5.0903707, -4.9999995, -2.6761668, -8.236391, -4.9999995, 2.676167, -8.236391, -4.9999995, 7.006295, -5.0903673, -4.9999995, 8.6602545, 0.0, -4.9999995, 9.848078, 0.0, -1.7364818, 7.9672623, 5.7885547, -1.7364818, 3.0432231, 9.366078, -1.7364818, -3.0432239, 9.366078, -1.7364818, -7.9672627, 5.788554, -1.7364818, -9.848078, -8.6094633E-7, -1.7364818, -7.967262, -5.788556, -1.7364818, -3.0432243, -9.366078, -1.7364818, 3.0432246, -9.366078, -1.7364818, 7.9672647, -5.788552, -1.7364818, 9.848078, 0.0, -1.7364818, 9.848078, 0.0, 1.7364826, 7.9672623, 5.7885547, 1.7364826, 3.0432231, 9.366078, 1.7364826, -3.0432239, 9.366078, 1.7364826, -7.9672627, 5.788554, 1.7364826, -9.848078, -8.6094633E-7, 1.7364826, -7.967262, -5.788556, 1.7364826, -3.0432243, -9.366078, 1.7364826, 3.0432246, -9.366078, 1.7364826, 7.9672647, -5.788552, 1.7364826, 9.848078, 0.0, 1.7364826, 8.660254, 0.0, 5.0000005, 7.0062923, 5.090369, 5.0000005, 2.6761653, 8.236391, 5.0000005, -2.6761658, 8.23639, 5.0000005, -7.006293, 5.0903687, 5.0000005, -8.660254, -7.571034E-7, 5.0000005, -7.006292, -5.09037, 5.0000005, -2.6761663, -8.23639, 5.0000005, 2.6761665, -8.23639, 5.0000005, 7.0062943, -5.090367, 5.0000005, 8.660254, 0.0, 5.0000005, 6.427875, 0.0, 7.660445, 5.20026, 3.7782102, 7.660445, 1.9863225, 6.1132727, 7.660445, -1.9863229, 6.113272, 7.660445, -5.2002606, 3.7782097, 7.660445, -6.427875, -5.6194267E-7, 7.660445, -5.2002597, -3.7782109, 7.660445, -1.9863232, -6.113272, 7.660445, 1.9863235, -6.113272, 7.660445, 5.2002616, -3.7782083, 7.660445, 6.427875, 0.0, 7.660445, 3.4201992, 0.0, 9.396927, 2.7669992, 2.0103426, 9.396927, 1.0568995, 3.2528028, 9.396927, -1.0568998, 3.2528026, 9.396927, -2.7669995, 2.0103424, 9.396927, -3.4201992, -2.9900332E-7, 9.396927, -2.766999, -2.010343, 9.396927, -1.0569, -3.2528026, 9.396927, 1.0569001, -3.2528026, 9.396927, 2.7670002, -2.0103416, 9.396927, 3.4201992, 0.0, 9.396927, 0.0, 0.0, -10.0, 0.0, 0.0, 10.0]);
        mesh.setData(Mesh.S_NORMALS, [-0.34201992, -0.0, 0.9396927, -0.27669993, -0.20103426, 0.9396927, -0.10568996, -0.32528028, 0.9396927, 0.10568998, -0.32528028, 0.9396927, 0.27669996, -0.20103423, 0.9396927, 0.34201992, 2.990033E-8, 0.9396927, 0.2766999, 0.20103431, 0.9396927, 0.10569, 0.32528028, 0.9396927, -0.10569002, 0.32528028, 0.9396927, -0.27670002, 0.20103417, 0.9396927, -0.34201992, -0.0, 0.9396927, -0.6427875, -0.0, 0.76604456, -0.520026, -0.37782103, 0.76604456, -0.19863226, -0.6113273, 0.76604456, 0.19863228, -0.61132723, 0.76604456, 0.5200261, -0.37782097, 0.76604456, 0.6427875, 5.6194267E-8, 0.76604456, 0.52002597, 0.3778211, 0.76604456, 0.19863233, 0.61132723, 0.76604456, -0.19863234, 0.61132723, 0.76604456, -0.52002615, 0.37782082, 0.76604456, -0.6427875, -0.0, 0.76604456, -0.86602545, -0.0, 0.49999997, -0.70062935, -0.50903696, 0.49999997, -0.26761654, -0.82363915, 0.4999999, 0.2676166, -0.8236391, 0.49999997, 0.70062935, -0.5090369, 0.4999999, 0.86602545, 7.5710346E-8, 0.49999997, 0.70062923, 0.509037, 0.4999999, 0.2676167, 0.8236391, 0.49999997, -0.26761672, 0.8236391, 0.49999997, -0.7006295, 0.5090367, 0.4999999, -0.86602545, -0.0, 0.49999997, -0.9848078, -0.0, 0.17364818, -0.7967262, -0.57885545, 0.17364818, -0.30432233, -0.93660784, 0.17364818, 0.3043224, -0.93660784, 0.17364818, 0.7967263, -0.57885545, 0.17364818, 0.9848078, 8.609464E-8, 0.17364818, 0.79672617, 0.57885563, 0.17364818, 0.30432245, 0.93660784, 0.17364818, -0.30432245, 0.93660784, 0.17364818, -0.79672647, 0.5788552, 0.17364818, -0.9848078, -0.0, 0.17364818, -0.9848078, -0.0, -0.17364827, -0.7967262, -0.57885545, -0.17364827, -0.30432233, -0.93660784, -0.17364827, 0.3043224, -0.93660784, -0.17364827, 0.7967263, -0.57885545, -0.17364827, 0.9848078, 8.609464E-8, -0.17364827, 0.7967261, 0.5788556, -0.17364825, 0.30432242, 0.9366078, -0.17364825, -0.30432245, 0.9366078, -0.17364825, -0.79672647, 0.5788552, -0.17364827, -0.9848078, -0.0, -0.17364827, -0.8660254, -0.0, -0.50000006, -0.70062923, -0.50903696, -0.50000006, -0.26761654, -0.8236391, -0.50000006, 0.2676166, -0.82363904, -0.50000006, 0.7006293, -0.5090369, -0.50000006, 0.8660254, 7.571034E-8, -0.50000006, 0.7006292, 0.509037, -0.50000006, 0.26761663, 0.82363904, -0.50000006, -0.26761666, 0.82363904, -0.50000006, -0.7006294, 0.5090367, -0.50000006, -0.8660254, -0.0, -0.50000006, -0.6427875, -0.0, -0.76604456, -0.520026, -0.37782103, -0.76604456, -0.19863226, -0.6113273, -0.76604456, 0.19863228, -0.61132723, -0.76604456, 0.5200261, -0.37782097, -0.76604456, 0.6427875, 5.6194267E-8, -0.76604456, 0.52002597, 0.3778211, -0.76604456, 0.19863233, 0.61132723, -0.76604456, -0.19863234, 0.61132723, -0.76604456, -0.52002615, 0.37782082, -0.76604456, -0.6427875, -0.0, -0.76604456, -0.34201992, -0.0, -0.9396927, -0.27669993, -0.20103426, -0.9396927, -0.10568996, -0.32528028, -0.9396927, 0.10568998, -0.32528028, -0.9396927, 0.27669996, -0.20103423, -0.9396927, 0.34201992, 2.990033E-8, -0.9396927, 0.2766999, 0.20103431, -0.9396927, 0.10569, 0.32528028, -0.9396927, -0.10569002, 0.32528028, -0.9396927, -0.27670002, 0.20103417, -0.9396927, -0.34201992, -0.0, -0.9396927, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0]);
        mesh.setData(Mesh.S_INDICES, [0, 11, 1, 1, 11, 12, 1, 12, 2, 2, 12, 13, 2, 13, 3, 3, 13, 14, 3, 14, 4, 4, 14, 15, 4, 15, 5, 5, 15, 16, 5, 16, 6, 6, 16, 17, 6, 17, 7, 7, 17, 18, 7, 18, 8, 8, 18, 19, 8, 19, 9, 9, 19, 20, 9, 20, 10, 10, 20, 21, 11, 22, 12, 12, 22, 23, 12, 23, 13, 13, 23, 24, 13, 24, 14, 14, 24, 25, 14, 25, 15, 15, 25, 26, 15, 26, 16, 16, 26, 27, 16, 27, 17, 17, 27, 28, 17, 28, 18, 18, 28, 29, 18, 29, 19, 19, 29, 30, 19, 30, 20, 20, 30, 31, 20, 31, 21, 21, 31, 32, 22, 33, 23, 23, 33, 34, 23, 34, 24, 24, 34, 35, 24, 35, 25, 25, 35, 36, 25, 36, 26, 26, 36, 37, 26, 37, 27, 27, 37, 38, 27, 38, 28, 28, 38, 39, 28, 39, 29, 29, 39, 40, 29, 40, 30, 30, 40, 41, 30, 41, 31, 31, 41, 42, 31, 42, 32, 32, 42, 43, 33, 44, 34, 34, 44, 45, 34, 45, 35, 35, 45, 46, 35, 46, 36, 36, 46, 47, 36, 47, 37, 37, 47, 48, 37, 48, 38, 38, 48, 49, 38, 49, 39, 39, 49, 50, 39, 50, 40, 40, 50, 51, 40, 51, 41, 41, 51, 52, 41, 52, 42, 42, 52, 53, 42, 53, 43, 43, 53, 54, 44, 55, 45, 45, 55, 56, 45, 56, 46, 46, 56, 57, 46, 57, 47, 47, 57, 58, 47, 58, 48, 48, 58, 59, 48, 59, 49, 49, 59, 60, 49, 60, 50, 50, 60, 61, 50, 61, 51, 51, 61, 62, 51, 62, 52, 52, 62, 63, 52, 63, 53, 53, 63, 64, 53, 64, 54, 54, 64, 65, 55, 66, 56, 56, 66, 67, 56, 67, 57, 57, 67, 68, 57, 68, 58, 58, 68, 69, 58, 69, 59, 59, 69, 70, 59, 70, 60, 60, 70, 71, 60, 71, 61, 61, 71, 72, 61, 72, 62, 62, 72, 73, 62, 73, 63, 63, 73, 74, 63, 74, 64, 64, 74, 75, 64, 75, 65, 65, 75, 76, 66, 77, 67, 67, 77, 78, 67, 78, 68, 68, 78, 79, 68, 79, 69, 69, 79, 80, 69, 80, 70, 70, 80, 81, 70, 81, 71, 71, 81, 82, 71, 82, 72, 72, 82, 83, 72, 83, 73, 73, 83, 84, 73, 84, 74, 74, 84, 85, 74, 85, 75, 75, 85, 86, 75, 86, 76, 76, 86, 87, 0, 1, 88, 1, 2, 88, 2, 3, 88, 3, 4, 88, 4, 5, 88, 5, 6, 88, 6, 7, 88, 7, 8, 88, 8, 9, 88, 9, 10, 88, 77, 89, 78, 78, 89, 79, 79, 89, 80, 80, 89, 81, 81, 89, 82, 82, 89, 83, 83, 89, 84, 84, 89, 85, 85, 89, 86, 86, 89, 87]);
        return mesh;
    }

    /**
     * 根据AABBBoundingBox创建包围盒渲染数据。<br/>
     * @param {AABBBoudingBox}[aabbBoundingBox]
     * @return {Mesh}
     */
    static createAABBBoundingBoxMeshFromAABBBoundingBox(aabbBoundingBox){
        let mesh = new Mesh();
        // 计算4个点
        let min = aabbBoundingBox.getMin();
        let max = aabbBoundingBox.getMax();

        let positions = [
            // bbl
            min._m_X, min._m_Y, min._m_Z,
            // bfl
            min._m_X, min._m_Y, max._m_Z,
            // bbr
            max._m_X, min._m_Y, min._m_Z,
            // bfr
            max._m_X, min._m_Y, max._m_Z,

            // tbl
            min._m_X, max._m_Y, min._m_Z,
            // tfl
            min._m_X, max._m_Y, max._m_Z,
            // tbr
            max._m_X, max._m_Y, min._m_Z,
            // tfr
            max._m_X, max._m_Y, max._m_Z
        ];
        let indices = [
            // bottom
            0, 1,
            1, 3,
            3, 2,
            2, 0,

            // top
            4, 5,
            5, 7,
            7, 6,
            6, 4,

            // left
            0, 4,
            1, 5,

            // right
            2, 6,
            3, 7
        ];
        mesh.setData(Mesh.S_POSITIONS, positions);
        mesh.setData(Mesh.S_INDICES, indices);

        mesh.setPrimitive(Mesh.S_PRIMITIVE_LINES);
        return mesh;
    }

    /**
     * 基于指定Camera创建视锥体。<br/>
     * 注意:返回的视锥体是当前Camera状态下的可视化，即处于当前Camera位置，如果要单独创建位于原点的视锥体，请将viewSpace设置为false。<br/>
     * @param {Camera}[camera]
     * @param {Boolean}[viewSpace 默认为true,表示计算结果为viewSpace]
     * @return {Mesh}
     */
    static createViewFrustumMeshFromCamera(camera, viewSpace){
        let w = camera.getWidth();
        let h = camera.getHeight();

        let positions = [];
        MeshFactor.pushVec3ToArray(positions, camera.getWorldCoordinates(new Vector2(0, 0), 0, viewSpace || true));
        MeshFactor.pushVec3ToArray(positions, camera.getWorldCoordinates(new Vector2(0, h), 0, viewSpace || true));
        MeshFactor.pushVec3ToArray(positions, camera.getWorldCoordinates(new Vector2(w, h), 0, viewSpace || true));
        MeshFactor.pushVec3ToArray(positions, camera.getWorldCoordinates(new Vector2(w, 0), 0, viewSpace || true));

        MeshFactor.pushVec3ToArray(positions, camera.getWorldCoordinates(new Vector2(0, 0), 1, viewSpace || true));
        MeshFactor.pushVec3ToArray(positions, camera.getWorldCoordinates(new Vector2(0, h), 1, viewSpace || true));
        MeshFactor.pushVec3ToArray(positions, camera.getWorldCoordinates(new Vector2(w, h), 1, viewSpace || true));
        MeshFactor.pushVec3ToArray(positions, camera.getWorldCoordinates(new Vector2(w, 0), 1, viewSpace || true));

        // indices
        let indices = [
            0, 1,
            1, 2,
            2, 3,
            3, 0,

            4, 5,
            5, 6,
            6, 7,
            7, 4,

            0, 4,
            1, 5,
            2, 6,
            3, 7
        ];

        let mesh = new Mesh();
        mesh.setData(Mesh.S_POSITIONS, positions);
        mesh.setData(Mesh.S_INDICES, indices);
        mesh.setPrimitive(Mesh.S_PRIMITIVE_LINES);
        return mesh;
    }
}
