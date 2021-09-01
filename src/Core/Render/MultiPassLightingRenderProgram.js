import DefaultRenderProgram from "./DefaultRenderProgram.js";
import RenderState from "../WebGL/RenderState.js";
import DirectionalLight from "../Light/DirectionalLight.js";
import TempVars from "../Util/TempVars.js";
import Matrix44 from "../Math3d/Matrix44.js";

/**
 * 光照通过多个Pass累计着色，为了性能考虑，这里采用了光锥裁剪进行逐光源Shading。<br/>
 * @author Kkk
 * @date 2021年8月31日21点49分
 * @update 2021年9月1日16点51分
 */
export default class MultiPassLightingRenderProgram extends DefaultRenderProgram{
    static PROGRAM_TYPE = 'MultiPassLighting';
    static S_CUR_LIGHT_COUNT = '_curLightCount';
    static S_AMBIENT_LIGHT_COLOR = '_ambientLightColor';
    static S_MULTI_ID_SRC = '_multiId';
    static S_V_LIGHT_DATA = '_vLightData';
    static S_W_LIGHT_DATA = '_wLightData';
    static S_V_LIGHT_DATA0 = '_vLight_Data_0';
    static S_V_LIGHT_DATA1 = '_vLight_Data_1';
    static S_V_LIGHT_DATA2 = '_vLight_Data_2';
    static S_W_LIGHT_DATA0 = '_wLight_Data_0';
    static S_W_LIGHT_DATA1 = '_wLight_Data_1';
    static S_W_LIGHT_DATA2 = '_wLight_Data_2';
    constructor(props) {
        super(props);
        this._m_AccumulationLights = new RenderState();
        this._m_AccumulationLights.setFlag(RenderState.S_STATES[4], 'On');
        this._m_AccumulationLights.setFlag(RenderState.S_STATES[1], 'Off');
        this._m_AccumulationLights.setFlag(RenderState.S_STATES[5], ['SRC_ALPHA', 'ONE']);
    }

    /**
     *
     * @param gl
     * @param scene
     * @param {FrameContext}[frameContext]
     * @param lights
     * @param batchSize
     * @param lastIndex
     * @param lightIndex
     * @param passId
     * @private
     */
    _uploadLights(gl, scene, frameContext, lights, batchSize, lastIndex, lightIndex, passId){
        let conVars = frameContext.m_LastSubShader.getContextVars();
        gl.uniform1i(conVars[MultiPassLightingRenderProgram.S_MULTI_ID_SRC].loc, passId);
        if(lastIndex == 0){
            // 提交合计的ambientColor(场景可能添加多个ambientLight)
            // 也可以设计为场景只能存在一个ambientColor
            let ambientLightColor = scene.AmbientLightColor;
            gl.uniform3f(conVars[MultiPassLightingRenderProgram.S_AMBIENT_LIGHT_COLOR].loc, ambientLightColor._m_X, ambientLightColor._m_Y, ambientLightColor._m_Z);
        }
        else{
            // 开启累积缓存模式
            // 我们使用result = s * s_alpha + d * 1.0
            // 所以,渲染当前pass,s部分在当前混合下应该使用一个全黑的ambientLightColor(因为第一个pass已经计算了ambientLightColor)
            gl.uniform3f(conVars[MultiPassLightingRenderProgram.S_AMBIENT_LIGHT_COLOR].loc, 0.0, 0.0, 0.0);
            scene.getRender()._checkRenderState(gl, this._m_AccumulationLights, frameContext.getRenderState());
        }
        if(passId == 0){
            let lightSpaceLoc = null;
            let lightSpace = null;
            if(conVars[MultiPassLightingRenderProgram.S_V_LIGHT_DATA]){
                lightSpace = 1;
                lightSpaceLoc = conVars[MultiPassLightingRenderProgram.S_V_LIGHT_DATA].loc;
            }
            else{
                lightSpace = 0;
                lightSpaceLoc = conVars[MultiPassLightingRenderProgram.S_W_LIGHT_DATA].loc;
            }
            // 计算实际需要上载的灯光
            let curLightCount = (batchSize + lastIndex) > lights.length ? (lights.length - lastIndex) : batchSize;
            let light = null;
            let lightColor = null;
            // 灯光数据
            let lightData = TempVars.S_LIGHT_DATA;
            let array = lightData.getArray();
            let tempVec4 = TempVars.S_TEMP_VEC4;
            let tempVec42 = TempVars.S_TEMP_VEC4_2;
            // 上载灯光信息
            // 数据编码格式内容
            // 第一个元素保存光照颜色,w分量保存光照类型(0DirectionalLight,1PointLight,2SpotLight)
            for(let i = lastIndex,offset = 0,end = curLightCount + lastIndex;i < end;i++,offset+=12){
                light = lights[i];
                lightColor = light.getColor();
                array[offset] = lightColor._m_X;
                array[offset + 1] = lightColor._m_Y;
                array[offset + 2] = lightColor._m_Z;
                array[offset + 3] = light.getTypeId();
                switch (light.getType()) {
                    case 'DirectionalLight':
                        // 提交灯光方向
                        if(lightSpace){
                            // 在视图空间计算光源,避免在片段着色阶段计算viewDir
                            tempVec42.setToInXYZW(light.getDirection()._m_X, light.getDirection()._m_Y, light.getDirection()._m_Z, 0);
                            Matrix44.multiplyMV(tempVec4, tempVec42, scene.getMainCamera().getViewMatrix());
                            array[offset + 4] = tempVec4._m_X;
                            array[offset + 5] = tempVec4._m_Y;
                            array[offset + 6] = tempVec4._m_Z;
                            array[offset + 7] = -1;
                        }
                        else{
                            // 在世界空间计算光源
                            array[offset + 4] = light.getDirection()._m_X;
                            array[offset + 5] = light.getDirection()._m_Y;
                            array[offset + 6] = light.getDirection()._m_Z;
                            array[offset + 7] = -1;
                        }
                        // 第三个数据占位(不要假设默认为0,因为重复使用这个缓存,所以最好主动填充0)
                        array[offset + 8] = 0;
                        array[offset + 9] = 0;
                        array[offset + 10] = 0;
                        array[offset + 11] = 0;
                        break;
                    case 'PointLight':
                        if(lightSpace){
                            // view空间
                        }
                        else{
                            // 世界空间
                            array[offset + 4] = light.getPosition()._m_X;
                            array[offset + 5] = light.getPosition()._m_Y;
                            array[offset + 6] = light.getPosition()._m_Z;
                            array[offset + 7] = light.getInRadius();
                        }
                        // 第三个数据占位(不要假设默认为0,因为重复使用这个缓存,所以最好主动填充0)
                        array[offset + 8] = 0;
                        array[offset + 9] = 0;
                        array[offset + 10] = 0;
                        array[offset + 11] = 0;
                        break;
                    case 'SpotLight':
                        if(lightSpace){

                        }
                        else{
                            // 世界空间
                            array[offset + 4] = light.getPosition()._m_X;
                            array[offset + 5] = light.getPosition()._m_Y;
                            array[offset + 6] = light.getPosition()._m_Z;
                            array[offset + 7] = light.getInvSpotRange();
                        }
                        // 提交spotDir其他信息
                        array[offset + 8] = light.getDirection()._m_X;
                        array[offset + 9] = light.getDirection()._m_Y;
                        array[offset + 10] = light.getDirection()._m_Z;
                        array[offset + 11] = light.getPackedAngleCos();
                        break;
                }
            }
            // 上载数据
            // gl[conVars[MultiPassLightingRenderProgram.S_LIGHT_DATA].fun]
            gl.uniform4fv(lightSpaceLoc, lightData.getBufferData(), 0, curLightCount * 12);
            gl.uniform1i(conVars[MultiPassLightingRenderProgram.S_CUR_LIGHT_COUNT].loc, curLightCount * 3);
            return curLightCount + lastIndex;
        }
        else if(passId == 1){
            let lightSpaceLoc = null;
            let lightSpaceLoc1 = null;
            let lightSpaceLoc2 = null;
            let lightSpace = null;
            let tempVec4 = TempVars.S_TEMP_VEC4;
            let tempVec42 = TempVars.S_TEMP_VEC4_2;
            let tempVec43 = TempVars.S_TEMP_VEC4_3;
            if(conVars[MultiPassLightingRenderProgram.S_V_LIGHT_DATA0]){
                lightSpace = 1;
                lightSpaceLoc = conVars[MultiPassLightingRenderProgram.S_V_LIGHT_DATA0].loc;
                lightSpaceLoc1 = conVars[MultiPassLightingRenderProgram.S_V_LIGHT_DATA1].loc;
                lightSpaceLoc2 = conVars[MultiPassLightingRenderProgram.S_V_LIGHT_DATA2].loc;
            }
            else{
                lightSpace = 0;
                lightSpaceLoc = conVars[MultiPassLightingRenderProgram.S_W_LIGHT_DATA0].loc;
                lightSpaceLoc1 = conVars[MultiPassLightingRenderProgram.S_W_LIGHT_DATA1].loc;
                lightSpaceLoc2 = conVars[MultiPassLightingRenderProgram.S_W_LIGHT_DATA2].loc;
            }
            let light = null;
            let lightColor = null;
            light = lights[lightIndex];
            lightColor = light.getColor();
            tempVec4.setToInXYZW(lightColor._m_X, lightColor._m_Y, lightColor._m_Z, light.getTypeId());
            switch (light.getType()) {
                case 'PointLight':
                    if(lightSpace){
                        // view空间
                    }
                    else{
                        // 世界空间
                        tempVec42.setToInXYZW(light.getPosition()._m_X, light.getPosition()._m_Y, light.getPosition()._m_Z, light.getInRadius());
                    }
                    // 第三个数据占位(不要假设默认为0,因为重复使用这个缓存,所以最好主动填充0)
                    tempVec43.setToInXYZW(0, 0, 0, 0);
                    break;
                case 'SpotLight':
                    if(lightSpace){

                    }
                    else{
                        // 世界空间
                        tempVec42.setToInXYZW(light.getPosition()._m_X, light.getPosition()._m_Y, light.getPosition()._m_Z, light.getInvSpotRange());
                    }
                    // 提交spotDir其他信息
                    tempVec43.setToInXYZW(light.getDirection()._m_X, light.getDirection()._m_Y, light.getDirection()._m_Z, light.getPackedAngleCos());
                    break;
            }
            // 光锥裁剪
            gl.uniform4f(lightSpaceLoc, tempVec4._m_X, tempVec4._m_Y, tempVec4._m_Z, tempVec4._m_W);
            gl.uniform4f(lightSpaceLoc1, tempVec42._m_X, tempVec42._m_Y, tempVec42._m_Z, tempVec42._m_W);
            gl.uniform4f(lightSpaceLoc2, tempVec43._m_X, tempVec43._m_Y, tempVec43._m_Z, tempVec43._m_W);
        }
        return 1;
    }
    draw(gl, scene, frameContext, iDrawable, lights) {

        // 如果灯光数量为0,则直接执行渲染
        if(lights.length == 0){
            iDrawable.draw(frameContext);
            return;
        }

        // 批量提交灯光
        // 应该根据引擎获取每次提交的灯光批次数量
        // 但是每个批次不应该超过batchSize
        let batchSize = scene.getRender().getBatchLightSize();
        frameContext.getRenderState().store();
        // 首先将dir light部分取出来
        let dirLights = [];
        let otherLights = [];
        lights.forEach(light=>{
            if(light.getType() == 'DirectionalLight'){
                dirLights.push(light);
            }
            else{
                otherLights.push(light);
            }
        });
        // 在第一个pass中渲染dirLights
        let lastIndex = 0;
        while(lastIndex < dirLights.length){
            // 更新灯光信息
            lastIndex = this._uploadLights(gl, scene, frameContext, dirLights, batchSize, lastIndex, -1, 0);
            // 最后draw
            iDrawable.draw(frameContext);
        }
        let index = 0;
        // 在第二个pass中渲染otherLights
        while(index < otherLights.length){
            // 更新灯光信息
            index += this._uploadLights(gl, scene, frameContext, otherLights, batchSize, lastIndex > 0 ? lastIndex : index, index, 1);
            // 最后draw
            iDrawable.draw(frameContext);
        }
        scene.getRender()._checkRenderState(gl, frameContext.getRenderState().restore(), frameContext.getRenderState());
        frameContext.BatchLightLastIndex = lastIndex;
    }
    drawArrays(gl, scene, frameContext, iDrawables, lights){
        // 如果灯光数量为0,则直接执行渲染
        if(lights.length == 0){
            iDrawables.forEach(iDrawable=>{
                iDrawable.draw(frameContext);
            });
            return;
        }

        // 批量提交灯光
        // 应该根据引擎获取每次提交的灯光批次数量
        // 但是每个批次不应该超过batchSize
        let batchSize = scene.getRender().getBatchLightSize();
        frameContext.getRenderState().store();
        // 首先将dir light部分取出来
        let dirLights = [];
        let otherLights = [];
        lights.forEach(light=>{
            if(light.getType() == 'DirectionalLight'){
                dirLights.push(light);
            }
            else{
                otherLights.push(light);
            }
        });
        // 在第一个pass中渲染dirLights
        let lastIndex = 0;
        while(lastIndex < dirLights.length){
            // 更新灯光信息
            lastIndex = this._uploadLights(gl, scene, frameContext, dirLights, batchSize, lastIndex, -1, 0);
            // 最后draw
            iDrawables.forEach(iDrawable=>{
                iDrawable.draw(frameContext);
            });
        }
        let index = 0;
        // 在第二个pass中渲染otherLights
        while(index < otherLights.length){
            // 更新灯光信息
            index += this._uploadLights(gl, scene, frameContext, otherLights, batchSize, lastIndex > 0 ? lastIndex : index, index, 1);
            // 最后draw
            iDrawables.forEach(iDrawable=>{
                iDrawable.draw(frameContext);
            });
        }
        scene.getRender()._checkRenderState(gl, frameContext.getRenderState().restore(), frameContext.getRenderState());
        frameContext.BatchLightLastIndex = lastIndex;

    }
}
