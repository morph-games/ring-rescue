(function () {
  'use strict';

  // WebGL framework
  // ===============

  let t$1,
  W$1 = {
    
    // List of 3D models that can be rendered by the framework
    // (See the end of the file for built-in models: plane, billboard, cube, pyramid...)
    models: {},
    
    // List of custom renderers
    //renderers: {},

    // Reset the framework
    // param: a <canvas> element
    reset: canvas => {
      
      // Globals
      W$1.canvas = canvas;    // canvas element
      W$1.objs = 0;           // Object counter
      W$1.current = {};       // Objects current states
      W$1.next = {};          // Objects next states
      W$1.textures = {};      // Textures list

      // WebGL context
      W$1.gl = canvas.getContext('webgl2');
      
      // Default blending method for transparent objects
      W$1.gl.blendFunc(770 /* SRC_ALPHA */, 771 /* ONE_MINUS_SRC_ALPHA */);
      
      // Enable texture 0
      W$1.gl.activeTexture(33984 /* TEXTURE0 */);

      // Create a WebGL program
      W$1.program = W$1.gl.createProgram();
      
      // Hide polygons back-faces (optional)
      W$1.gl.enable(2884 /* CULL_FACE */);
      
      // Create a Vertex shader
      // (this GLSL program is called for every vertex of the scene)
      W$1.gl.shaderSource(
        
        t$1 = W$1.gl.createShader(35633 /* VERTEX_SHADER */),
        
        `#version 300 es
      precision highp float;
      in vec4 pos, col, uv, normal;
      uniform mat4 pv, eye, m, im;
      uniform vec4 bb;
      out vec4 v_pos, v_col, v_uv, v_normal;
      void main() {
        gl_Position = pv * (v_pos = bb.z > 0. ? m[3] + eye * (pos * bb) : m * pos);                                          
        v_col = col;
        v_uv = uv;
        v_normal = transpose(inverse(m)) * normal;
      }`
        // `#version 300 es
        // precision highp float;                        // Set default float precision
        // in vec4 pos, col, uv, normal;                 // Vertex attributes: position, color, texture coordinates, normal (if any)
        // uniform mat4 pv, eye, m, im;                  // Uniform transformation matrices: projection * view, eye, model, inverse model
        // uniform vec4 bb;                              // If the current shape is a billboard: bb = [w, h, 1.0, 0.0]
        // out vec4 v_pos, v_col, v_uv, v_normal;        // Varyings sent to the fragment shader: position, color, texture coordinates, normal (if any)
        // void main() {                                 
        //   gl_Position = pv * (                        // Set vertex position: p * v * v_pos
        //     v_pos = bb.z > 0.                         // Set v_pos varying:
        //     ? m[3] + eye * (pos * bb)                 // Billboards always face the camera:  p * v * distance + eye * (position * [w, h, 1.0, 0.0])
        //     : m * pos                                 // Other objects rotate normally:      p * v * m * position
        //   );                                          
        //   v_col = col;                                // Set varyings 
        //   v_uv = uv;
        //   v_normal = transpose(inverse(m)) * normal;  // recompute normals to match model thansformation
        // }`
      );
      
      // Compile the Vertex shader and attach it to the program
      W$1.gl.compileShader(t$1);
      W$1.gl.attachShader(W$1.program, t$1);
      console.log('vertex shader:', W$1.gl.getShaderInfoLog(t$1) || 'OK');
      
      // Create a Fragment shader
      // (This GLSL program is called for every fragment (pixel) of the scene)
      W$1.gl.shaderSource(

        t$1 = W$1.gl.createShader(35632 /* FRAGMENT_SHADER */),
        
        `#version 300 es
      precision highp float;
      in vec4 v_pos, v_col, v_uv, v_normal;
      uniform vec3 light;
      uniform vec4 o;
      uniform sampler2D sampler;
      out vec4 c;
      void main() {
        c = mix(texture(sampler, v_uv.xy), v_col, o[3]);
        if(o[1] > 0.){
          c = vec4(c.rgb * (max(0., dot(light, -normalize(o[0] > 0. ? vec3(v_normal.xyz) : cross(dFdx(v_pos.xyz), dFdy(v_pos.xyz)))))
            + o[2]),
            c.a
          );
        }
      }`
        // `#version 300 es
        // precision highp float;                  // Set default float precision
        // in vec4 v_pos, v_col, v_uv, v_normal;   // Varyings received from the vertex shader: position, color, texture coordinates, normal (if any)
        // uniform vec3 light;                     // Uniform: light direction, smooth normals enabled
        // uniform vec4 o;                         // options [smooth, shading enabled, ambient, mix]
        // uniform sampler2D sampler;              // Uniform: 2D texture
        // out vec4 c;                             // Output: final fragment color

        // // The code below displays colored / textured / shaded fragments
        // void main() {
        //   c = mix(texture(sampler, v_uv.xy), v_col, o[3]);  // base color (mix of texture and rgba)
        //   if(o[1] > 0.){                                    // if lighting/shading is enabled:
        //     c = vec4(                                       // output = vec4(base color RGB * (directional shading + ambient light)), base color Alpha
        //       c.rgb * (max(0., dot(light, -normalize(       // Directional shading: compute dot product of light direction and normal (0 if negative)
        //         o[0] > 0.                                   // if smooth shading is enabled:
        //         ? vec3(v_normal.xyz)                        // use smooth normals passed as varying
        //         : cross(dFdx(v_pos.xyz), dFdy(v_pos.xyz))   // else, compute flat normal by making a cross-product with the current fragment and its x/y neighbours
        //       )))
        //       + o[2]),                                      // add ambient light passed as uniform
        //       c.a                                           // use base color's alpha
        //     );
        //   }
        // }`
      );
      
      // Compile the Fragment shader and attach it to the program
      W$1.gl.compileShader(t$1);
      W$1.gl.attachShader(W$1.program, t$1);
      console.log('fragment shader:', W$1.gl.getShaderInfoLog(t$1) || 'OK');
      
      // Compile the program
      W$1.gl.linkProgram(W$1.program);
      W$1.gl.useProgram(W$1.program);
      console.log('program:', W$1.gl.getProgramInfoLog(W$1.program) || 'OK');
      
      // Set the scene's background color (RGBA)
      W$1.gl.clearColor(1, 1, 1, 1);
      
      // Shortcut to set the clear color
      W$1.clearColor = c => W$1.gl.clearColor(...W$1.col(c));
      W$1.clearColor("fff");
      
      // Enable fragments depth sorting
      // (the fragments of close objects will automatically overlap the fragments of further objects)
      W$1.gl.enable(2929 /* DEPTH_TEST */);
      
      // When everything is loaded: set default light / camera
      W$1.light({y: -1});
      W$1.camera({fov: 30});
      
      // Draw the scene. Ignore the first frame because the default camera will probably be overwritten by the program
      setTimeout(W$1.draw, 16);
    },

    // Set a state to an object
    setState: (state, type, texture) => {

      // Custom name or default name ('o' + auto-increment)
      state.n ||= 'o' + W$1.objs++;
      
      // Size sets w, h and d at once (optional)
      if(state.size) state.w = state.h = state.d = state.size;
      
      // If a new texture is provided, build it and save it in W.textures
      if(state.t && state.t.width && !W$1.textures[state.t.id]){
        texture = W$1.gl.createTexture();
        W$1.gl.pixelStorei(37441 /* UNPACK_PREMULTIPLY_ALPHA_WEBGL */, true);
        W$1.gl.bindTexture(3553 /* TEXTURE_2D */, texture);
        W$1.gl.pixelStorei(37440 /* UNPACK_FLIP_Y_WEBGL */, 1);
        W$1.gl.texImage2D(3553 /* TEXTURE_2D */, 0, 6408 /* RGBA */, 6408 /* RGBA */, 5121 /* UNSIGNED_BYTE */, state.t);
        W$1.gl.generateMipmap(3553 /* TEXTURE_2D */);
        W$1.textures[state.t.id] = texture;
      }
      
      // Recompute the projection matrix if fov is set
      if(state.fov){  
        const {
          near = 1,
          far = 1000,
          fov,
          aspect = canvas.width / canvas.height  // Aspect ratio is w/h
        } = state; // near can't be 0
        const f = 1 / Math.tan(
          fov * Math.PI / 180 // fov in radians 
        ); 
        const nf = 1 / (near - far);
        W$1.projection = new DOMMatrix([
          f / aspect, 0, 0, 0,
          0, f, 0, 0, 
          0, 0, (far + near) * nf, -1,
          0, 0, 2 * near * far * nf, 0
        ]);
        // W.projection =     
        //   new DOMMatrix([
        //     (1 / Math.tan(state.fov * Math.PI / 180)) / (W.canvas.width / W.canvas.height), 0, 0, 0, 
        //     0, (1 / Math.tan(state.fov * Math.PI / 180)), 0, 0, 
        //     0, 0, -1001 / 999, -1,
        //     0, 0, -2002 / 999, 0
        //   ]);
      }
      
      // Save object's type,
      // merge previous state (or default state) with the new state passed in parameter,
      // and reset f (the animation timer)
      state = {type, ...(W$1.current[state.n] = W$1.next[state.n] || {w:1, h:1, d:1, x:0, y:0, z:0, rx:0, ry:0, rz:0, b:'888', mode:4, mix: 0}), ...state, f:0};
      
      // Build the model's vertices buffer if it doesn't exist yet
      if(W$1.models[state.type]?.vertices && !W$1.models?.[state.type].verticesBuffer){
        W$1.gl.bindBuffer(34962 /* ARRAY_BUFFER */, W$1.models[state.type].verticesBuffer = W$1.gl.createBuffer());
        W$1.gl.bufferData(34962 /* ARRAY_BUFFER */, new Float32Array(W$1.models[state.type].vertices), 35044 /*STATIC_DRAW*/);

        // Compute smooth normals if they don't exist yet (optional)
        if(!W$1.models[state.type].normals && W$1.smooth) W$1.smooth(state);
        
        // Make a buffer from the smooth/custom normals (if any)
        if(W$1.models[state.type].normals){
          W$1.gl.bindBuffer(34962 /* ARRAY_BUFFER */, W$1.models[state.type].normalsBuffer = W$1.gl.createBuffer());
          W$1.gl.bufferData(34962 /* ARRAY_BUFFER */, new Float32Array(W$1.models[state.type].normals.flat()), 35044 /*STATIC_DRAW*/); 
        }      
      }
      
      // Build the model's uv buffer (if any) if it doesn't exist yet
      if(W$1.models[state.type]?.uv && !W$1.models[state.type].uvBuffer){
        W$1.gl.bindBuffer(34962 /* ARRAY_BUFFER */, W$1.models[state.type].uvBuffer = W$1.gl.createBuffer());
        W$1.gl.bufferData(34962 /* ARRAY_BUFFER */, new Float32Array(W$1.models[state.type].uv), 35044 /*STATIC_DRAW*/); 
      }
      
      // Build the model's index buffer (if any) and smooth normals if they don't exist yet
      if(W$1.models[state.type]?.indices && !W$1.models[state.type].indicesBuffer){
        W$1.gl.bindBuffer(34963 /* ELEMENT_ARRAY_BUFFER */, W$1.models[state.type].indicesBuffer = W$1.gl.createBuffer());
        W$1.gl.bufferData(34963 /* ELEMENT_ARRAY_BUFFER */, new Uint16Array(W$1.models[state.type].indices), 35044 /* STATIC_DRAW */);
      }
      
      // Set mix to 1 if no texture is set
      if(!state.t){
        state.mix = 1;
      }

      // set mix to 0 by default if a texture is set
      else if(state.t && !state.mix){
        state.mix = 0;
      }
      
      // Save new state
      W$1.next[state.n] = state;
    },
    
    // Draw the scene
    draw: (now, dt, v, i, transparent = []) => {
      
      // Loop and measure time delta between frames
      dt = now - W$1.lastFrame;
      W$1.lastFrame = now;
     requestAnimationFrame(W$1.draw);
      
      if(W$1.next.camera.g){
        W$1.render(W$1.next[W$1.next.camera.g], dt, 1);
      }
      
      // Create a matrix called v containing the current camera transformation
      v = W$1.animation('camera');
      
      // If the camera is in a group
      if(W$1.next?.camera?.g){

        // premultiply the camera matrix by the group's model matrix.
        v.preMultiplySelf(W$1.next[W$1.next.camera.g].M || W$1.next[W$1.next.camera.g].m);
      }
      
      // Send it to the shaders as the Eye matrix
      W$1.gl.uniformMatrix4fv(
        W$1.gl.getUniformLocation(W$1.program, 'eye'),
        false,
        v.toFloat32Array()
      );
      
      // Invert it to obtain the View matrix
      v.invertSelf();

      // Premultiply it with the Perspective matrix to obtain a Projection-View matrix
      v.preMultiplySelf(W$1.projection);
      
      // send it to the shaders as the pv matrix
      W$1.gl.uniformMatrix4fv(
        W$1.gl.getUniformLocation(W$1.program, 'pv'),
        false,
        v.toFloat32Array()
      );

      // Clear canvas
      W$1.gl.clear(16640 /* W.gl.COLOR_BUFFER_BIT | W.gl.DEPTH_BUFFER_BIT */);
      
      // Render all the objects in the scene
      for(i in W$1.next){
        
        // Render the shapes with no texture and no transparency (RGB1 color)
        if(!W$1.next[i].t && W$1.col(W$1.next[i].b)[3] == 1){
          W$1.render(W$1.next[i], dt);
        }
        
        // Add the objects with transparency (RGBA or texture) in an array
        else {
          transparent.push(W$1.next[i]);
        }
      }
      
      // Order transparent objects from back to front
      transparent.sort((a, b) => {
        // Return a value > 0 if b is closer to the camera than a
        // Return a value < 0 if a is closer to the camera than b
        return W$1.dist(b) - W$1.dist(a);
      });

      // Enable alpha blending
      W$1.gl.enable(3042 /* BLEND */);

      // Render all transparent objects
      for(i of transparent){

        // Disable depth buffer write if it's a plane or a billboard to allow transparent objects to intersect planes more easily
        if(["plane","billboard"].includes(i.type)) W$1.gl.depthMask(0);
      
        W$1.render(i, dt);
        
        W$1.gl.depthMask(1);
      }
      
      // Disable alpha blending for the next frame
      W$1.gl.disable(3042 /* BLEND */);
      
      // Transition the light's direction and send it to the shaders
      W$1.gl.uniform3f(
        W$1.gl.getUniformLocation(W$1.program, 'light'),
        W$1.lerp('light','x'), W$1.lerp('light','y'), W$1.lerp('light','z')
      );
    },
    
    // Render an object
    render: (object, dt, just_compute = ['camera','light','group'].includes(object.type), buffer) => {
      // If the object has a texture
      if(object.t) {

        // Set the texture's target (2D or cubemap)
        W$1.gl.bindTexture(3553 /* TEXTURE_2D */, W$1.textures[object.t.id]);

        // Pass texture 0 to the sampler
        W$1.gl.uniform1i(W$1.gl.getUniformLocation(W$1.program, 'sampler'), 0);
      }

      // If the object has an animation, increment its timer...
      if(object.f < object.a) object.f += dt;
      // ...but don't let it go over the animation duration.
      else object.f = object.a;

      // Compose the model matrix from lerped transformations
      // Or Use the custom matrix provided with the `M` property
      W$1.next[object.n].m = W$1.next[object.n].M || W$1.animation(object.n);

      // If the object is in a group:
      if(W$1.next[object.g]){
        // premultiply the model matrix by the group's model matrix.
        W$1.next[object.n].m.preMultiplySelf(W$1.next[object.g].M || W$1.next[object.g].m);
      }

      // send the model matrix to the vertex shader
      W$1.gl.uniformMatrix4fv(
        W$1.gl.getUniformLocation(W$1.program, 'm'),
        false,
        W$1.next[object.n].m.toFloat32Array()
      );
      
      // send the inverse of the model matrix to the vertex shader
      W$1.gl.uniformMatrix4fv(
        W$1.gl.getUniformLocation(W$1.program, 'im'),
        false,
        // (new DOMMatrix(W.next[object.n].M || W.next[object.n].m)).invertSelf().toFloat32Array()
        DOMMatrix.fromMatrix(W$1.next[object.n].m).invertSelf().toFloat32Array()
      );
      
      // Don't render invisible items (camera, light, groups, camera's parent)
      if(!just_compute){
        // Set up the position buffer
        W$1.gl.bindBuffer(34962 /* ARRAY_BUFFER */, W$1.models[object.type].verticesBuffer);
        W$1.gl.vertexAttribPointer(buffer = W$1.gl.getAttribLocation(W$1.program, 'pos'), 3, 5126 /* FLOAT */, false, 0, 0);
        W$1.gl.enableVertexAttribArray(buffer);
        
        // Set up the texture coordinatess buffer (if any)
        if(W$1.models[object.type].uvBuffer){
          W$1.gl.bindBuffer(34962 /* ARRAY_BUFFER */, W$1.models[object.type].uvBuffer);
          W$1.gl.vertexAttribPointer(buffer = W$1.gl.getAttribLocation(W$1.program, 'uv'), 2, 5126 /* FLOAT */, false, 0, 0);
          W$1.gl.enableVertexAttribArray(buffer);
        }
        
        // Set the normals buffer
        if((object.s || W$1.models[object.type].customNormals) && W$1.models[object.type].normalsBuffer){
          W$1.gl.bindBuffer(34962 /* ARRAY_BUFFER */, W$1.models[object.type].normalsBuffer);
          W$1.gl.vertexAttribPointer(buffer = W$1.gl.getAttribLocation(W$1.program, 'normal'), 3, 5126 /* FLOAT */, false, 0, 0);
          W$1.gl.enableVertexAttribArray(buffer);
        }
        
        // Other options: [smooth, shading enabled, ambient light, texture/color mix]
        W$1.gl.uniform4f(

          W$1.gl.getUniformLocation(W$1.program, 'o'), 
          
          // Enable smooth shading if "s" is true
          object.s,
          
          // Enable shading if in TRIANGLE* mode and object.ns disabled
          ((object.mode > 3) || (W$1.gl[object.mode] > 3)) && !object.ns ? 1 : 0,
          
          // Ambient light
          W$1.ambientLight || 0.2,
          
          // Texture/color mix (if a texture is present. 0: fully textured, 1: fully colored)
          object.mix
        );
        
        // If the object is a billboard: send a specific uniform to the shaders:
        // [width, height, isBillboard = 1, 0]
        W$1.gl.uniform4f(
          W$1.gl.getUniformLocation(W$1.program, 'bb'),
          
          // Size
          object.w,
          object.h,               

          // is a billboard
          object.type == 'billboard',
          
          // Reserved
          0
        );
        
        // Set up the indices (if any)
        if(W$1.models[object.type].indicesBuffer){
          W$1.gl.bindBuffer(34963 /* ELEMENT_ARRAY_BUFFER */, W$1.models[object.type].indicesBuffer);
        }
          
        // Set the object's color
        W$1.gl.vertexAttrib4fv(
          W$1.gl.getAttribLocation(W$1.program, 'col'),
          W$1.col(object.b)
        );

        // Draw
        // Both indexed and unindexed models are supported.
        // You can keep the "drawElements" only if all your models are indexed.
        if(W$1.models[object.type].indicesBuffer){
          W$1.gl.drawElements(+object.mode || W$1.gl[object.mode], W$1.models[object.type].indices.length, 5123 /* UNSIGNED_SHORT */, 0);
        }
        else {
          W$1.gl.drawArrays(+object.mode || W$1.gl[object.mode], 0, W$1.models[object.type].vertices.length / 3);
        }
      }
    },
    
    // Helpers
    // -------
    
    // Interpolate a property between two values
    lerp: (item, property) => 
      W$1.next[item]?.a
      ? W$1.current[item][property] + (W$1.next[item][property] -  W$1.current[item][property]) * (W$1.next[item].f / W$1.next[item].a)
      : W$1.next[item][property],
    
    // Transition an item
    animation: (item, m = new DOMMatrix) =>
      W$1.next[item]
      ? m
        .translateSelf(W$1.lerp(item, 'x'), W$1.lerp(item, 'y'), W$1.lerp(item, 'z'))
        .rotateSelf(W$1.lerp(item, 'rx'),W$1.lerp(item, 'ry'),W$1.lerp(item, 'rz'))
        .scaleSelf(W$1.lerp(item, 'w'),W$1.lerp(item, 'h'),W$1.lerp(item, 'd'))
      : m,
      
    // Compute the distance squared between two objects (useful for sorting transparent items)
    dist: (a, b = W$1.next.camera) => a?.m && b?.m ? (b.m.m41 - a.m.m41)**2 + (b.m.m42 - a.m.m42)**2 + (b.m.m43 - a.m.m43)**2 : 0,
    
    // Set the ambient light level (0 to 1)
    ambient: a => W$1.ambientLight = a,
    
    // Convert an rgb/rgba hex string into a vec4
    col: c => [...c.replace("#","").match(c.length < 5 ? /./g : /../g).map(a => ('0x' + a) / (c.length < 5 ? 15 : 255)), 1], // rgb / rgba / rrggbb / rrggbbaa
    
    // Add a new 3D model
    add: (name, objects) => {
      W$1.models[name] = objects;
      if(objects.normals){
        W$1.models[name].customNormals = 1;
      }
      W$1[name] = settings => W$1.setState(settings, name);
    },
    
    // Built-in objects
    // ----------------
    
    group: t => W$1.setState(t, 'group'),
    
    move: (t, delay) => setTimeout(()=>{ W$1.setState(t); }, delay || 1),
    
    delete: (t, delay) => setTimeout(()=>{ delete W$1.next[t]; }, delay || 1),
    
    camera: (t, delay) => setTimeout(()=>{ W$1.setState(t, t.n = 'camera'); }, delay || 1),
      
    light: (t, delay) => delay ? setTimeout(()=>{ W$1.setState(t, t.n = 'light'); }, delay) : W$1.setState(t, t.n = 'light'),
  };

  // Smooth normals computation plug-in (optional)
  // =============================================

  W$1.smooth = (state, dict = {}, vertices = [], iterate, iterateSwitch, i, j, A, B, C, Ai, Bi, Ci, normal, AB, BC) => {
    
    // Prepare smooth normals array
    W$1.models[state.type].normals = [];
    
    // Fill vertices array: [[x,y,z],[x,y,z]...]
    for(i = 0; i < W$1.models[state.type].vertices.length; i+=3){
      vertices.push(W$1.models[state.type].vertices.slice(i, i+3));
    }
    
    // Iterator
    if(iterate = W$1.models[state.type].indices) iterateSwitch = 1;
    else iterate = vertices, iterateSwitch = 0;
      
    // Iterate twice on the vertices
    // - 1st pass: compute normals of each triangle and accumulate them for each vertex
    // - 2nd pass: save the final smooth normals values
    for(i = 0; i < iterate.length * 2; i+=3){
      j = i % iterate.length;
      A = vertices[Ai = iterateSwitch ? W$1.models[state.type].indices[j] : j];
      B = vertices[Bi = iterateSwitch ? W$1.models[state.type].indices[j+1] : j+1];
      C = vertices[Ci = iterateSwitch ? W$1.models[state.type].indices[j+2] : j+2];
      AB = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
      BC = [C[0] - B[0], C[1] - B[1], C[2] - B[2]];
      normal = i > j ? [0,0,0] : [AB[1] * BC[2] - AB[2] * BC[1], AB[2] * BC[0] - AB[0] * BC[2], AB[0] * BC[1] - AB[1] * BC[0]];
      dict[A[0]+"_"+A[1]+"_"+A[2]] ||= [0,0,0];
      dict[B[0]+"_"+B[1]+"_"+B[2]] ||= [0,0,0];
      dict[C[0]+"_"+C[1]+"_"+C[2]] ||= [0,0,0];
      W$1.models[state.type].normals[Ai] = dict[A[0]+"_"+A[1]+"_"+A[2]] = dict[A[0]+"_"+A[1]+"_"+A[2]].map((a,i) => a + normal[i]);
      W$1.models[state.type].normals[Bi] = dict[B[0]+"_"+B[1]+"_"+B[2]] = dict[B[0]+"_"+B[1]+"_"+B[2]].map((a,i) => a + normal[i]);
      W$1.models[state.type].normals[Ci] = dict[C[0]+"_"+C[1]+"_"+C[2]] = dict[C[0]+"_"+C[1]+"_"+C[2]].map((a,i) => a + normal[i]);
    }
  };


  // 3D models
  // =========

  // Each model has:
  // - A vertices array [x, y, z, x, y, z...]
  // - A uv array [u, v, u, v...] (optional. Allows texturing... if absent: RGBA coloring only)
  // - An indices array (optional, enables drawElements rendering... if absent: drawArrays is ised)
  // - A normals array [nx, ny, nz, nx, ny, nz...] (optional... if absent: hard/smooth normals are computed by the framework when they're needed)
  // The buffers (vertices, uv, indices) are built automatically when they're needed
  // All models are optional, you can remove the ones you don't need to save space
  // Custom models can be added from the same model, an OBJ importer is available on https://xem.github.io/WebGLFramework/obj2js/

  // Plane / billboard
  //
  //  v1------v0
  //  |       |
  //  |   x   |
  //  |       |
  //  v2------v3

  W$1.add("plane", {
    vertices: [
      .5, .5, 0,    -.5, .5, 0,   -.5,-.5, 0,
      .5, .5, 0,    -.5,-.5, 0,    .5,-.5, 0
    ],
    
    uv: [
      1, 1,     0, 1,    0, 0,
      1, 1,     0, 0,    1, 0
    ],
  });
  W$1.add("billboard", W$1.models.plane);

  const doc$1 = window.document;
  const isLocked = () => !!doc$1.pointerLockElement;
  var input = {
  	lockMove: { x: 0, y: 0 },
  	move: { x: 0, y: 0 },
  	wheel: 0,
  	click: null,
  	lockElt: null,
  	down: {},
  	isLocked,
  	async lock() {
  		if (!isLocked()) await this.lockElt.requestPointerLock();
  	},
  	async toggleLock() {
  		if (isLocked()) await this.unlock();
  		else await this.lock();
  	},
  	async unlock() {
  		await doc$1.exitPointerLock();
  	},
  	/** Get movement since last time movement was requested (i.e., last frame) */
  	getLockMove() {
  		const o = { ...this.lockMove };
  		this.lockMove.x = 0;
  		this.lockMove.y = 0;
  		return o;
  	},
  	getWheel() {
  		const w = this.wheel;
  		this.wheel = 0;
  		return w;
  	},
  	getClick() {
  		const c = this.click;
  		this.click = null;
  		return c;
  	},
  	setup(o = {}) {
  		this.lockElt = o.lockElt;
  		onmousemove = (e) => {
  			const move = this[isLocked() ? 'lockMove' : 'move'];
  			move.x += e.movementX;
  			move.y += e.movementY;
  		};
  		const fkey = (e) => (e.key.length === 1) ? e.key.toLowerCase() : e.key;
  		onkeydown = (e) => {
  			// treat all single keys as lowercase
  			const key = fkey(e);
  			this.down[key] = true;
  			if (!e.repeat && o.keys && o.keys[key]) {
  				o.keys[key]();
  				e.preventDefault();
  			}
  		};
  		onkeyup = (e) => {
  			this.down[fkey(e)] = false;
  		};
  		onwheel = (e) => {
  			this.wheel += e.deltaY;
  		};
  		const handleClick = (e) => {
  			const { clientX, clientY, button } = e;
  			const { key } = e.target.dataset;
  			if (key && o.keys && o.keys[key]) o.keys[key]();
  			this.click = { clientX, clientY, button, left: button === 0, right: button === 2,
  				locked: isLocked(),
  			};
  		};
  		onclick = handleClick;
  		oncontextmenu = handleClick;
  	},
  };

  // + https://lospec.com/palette-list/moondrom
  const BG_COLOR = '2a242b';
  const SHIP_COLOR = '#5796a1';
  const SHIP_COLOR2 = '#8bc7bf';
  const RING_COLOR = '#5796a1';
  const RING_COLOR2 = '478691';
  const P1_COLOR = '775b5b';
  const RED = '#b0455a';
  const P2_COLOR = RED;
  const SUN_COLOR = '#de8b6f'; // 'ff6633'
  const STAR_COLOR = '#ebd694';
  const SPACE_COLOR = '0000';
  const PLASMA_COLOR1 = '#de8b6f';
  const PLASMA_COLOR2 = '#b0455a';
  const PLASMA_COLOR3 = '#90d59c';
  const KSHIP_COLOR1 = '471b6e';
  const KSHIP_COLOR2 = '372b4e';
  const KSHIP_COLOR3 = '90d59c';
  const FLAME_ON_COLOR = 'ebd694dd';
  const FLAME_OFF_COLOR = 'ebd69400';
  const SCAN_COLOR = '90d59c';

  const doc = document;
  const $ = (q) => doc.querySelector(q);
  const $id = (id) => doc.getElementById(id);
  const $html = (id, h) => $id(id).innerHTML = h;
  function flashBorder(id, color = RED, duration = 1500) {
  	const animation = new Animation(
  		(new KeyframeEffect(
  			$id(id), // Element
  			[ // Keyframes
  				{ borderColor: color },
  				{ borderColor: '#000' },
  			],
  			{ duration, direction: 'alternate', easing: 'linear' } // key frame settings
  		)),
  		doc.timeline,
  	);
  	animation.play();
  }

  // Based off LittleJS's Vector2:
  // https://github.com/KilledByAPixel/LittleJS/blob/main/build/littlejs.esm.js#L693
  const vec3 = (x,y,z) => new Vector3(x,y,z);
  // const sin = Math.sin, cos = Math.cos, atan2 = Math.atan2;
  const { abs: abs$1, sin: sin$1, cos: cos$1, asin, acos, atan2, PI: PI$2, sqrt } = Math;

  const rad2deg = (rad) => rad * (180/PI$2);
  const deg2rad = (deg) => deg * (PI$2/180);

  class Vector3 {
  	constructor(x = 0, y = 0, z = 0) {
  		if (typeof x === 'object') {
  			y = x.y;
  			z = x.z;
  			x = x.x;
  		}
  		this.x = x;
  		this.y = y;
  		this.z = z;
  	}

  	copy() { return vec3(this.x, this.y, this.z); }

  	copyTo(obj) {
  		obj.x = this.x;
  		obj.y = this.y;
  		obj.z = this.z;
  	}

  	add(v) {
  		return vec3(
  			this.x + v.x,
  			this.y + v.y,
  			this.z + v.z,
  		);
  	}

  	sub(v) {
  		return vec3(
  			this.x - v.x,
  			this.y - v.y,
  			this.z - v.z,
  		);
  	}

  	length() {
  		return this.lengthSquared() ** .5;
  	}

  	lengthSquared() {
  		return ((this.x ** 2) + (this.y ** 2) + (this.z ** 2));
  	}

  	distance(v) {
  		return this.distanceSquared(v) ** .5;
  	}

  	distanceSquared(v) {
  		return ((this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2);

  	}

  	normalize(n = 1) {
  		const len = this.length();
  		return (len) ? this.scale(n / len) : vec3(0, n, 0);
  		// Defaults to y-axis - not sure what the best default direction is?
  	}

  	scale(s) {
  		return vec3(this.x * s, this.y * s, this.z * s);
  	}

  	cross(v) {
  		const { x, y, z } = this;
  		return vec3(
  			y * v.z - z * v.y,
  			z * v.x - x * v.z,
  			x * v.y - y * v.x,
  		);
  	}

  	rotate(angleX, angleY, angleZ) {
  		return this.rotateX(angleX).rotateY(angleY).rotateZ(angleZ);
  	}

  	rotateX(angle = 0) {
  		return vec3(
  			this.x,
  			this.y * cos$1(angle) - this.z * sin$1(angle),
  			this.y * sin$1(angle) + this.z * cos$1(angle),
  		);
  	}

  	rotateY(angle = 0) {
  		return vec3(
  			this.x * cos$1(angle) + this.z * sin$1(angle),
  			this.y,
  			-this.x * sin$1(angle) + this.z * cos$1(angle),
  		);
  	}

  	rotateZ(angle = 0) {
  		return vec3(
  			this.x * cos$1(angle) - this.y * sin$1(angle),
  			this.x * sin$1(angle) + this.y * cos$1(angle),
  			this.z,
  		);
  	}

  	toAngles(targetVector) {
  		let { x, y, z } = this;
  		if (targetVector) {
  			// return vec3(targetVector).sub(this).toAngles();
  			x = targetVector.x - x;
  			y = targetVector.y - y;
  			z = targetVector.z - z;
  		}
  		// Calculate yaw (rotation around z-axis)
  		const yaw = atan2(y, x);
  	
  		// Calculate pitch (rotation around y-axis)
  		const pitch = atan2(-z, sqrt(x * x + y * y));
  	
  		// Calculate roll (rotation around x-axis)
  		let roll = 0; // By default, assume roll is 0
  	
  		// If the target vector is not parallel to the xy-plane
  		if (x !== 0 || y !== 0) {
  			// Calculate the projected vector onto the xy-plane
  			const projectedVector = {
  				x: sqrt(x * x + y * y),
  				y: 0,
  				z
  			};
  			// Calculate the angle between the projected vector and the z-axis
  			roll = atan2(projectedVector.z, projectedVector.x);
  		}
  		return { roll, pitch, yaw };
  	}

  	toWAngles(targetVector) {
  		const { roll, pitch, yaw } = this.toAngles(targetVector);
  		return {
  			rx: rad2deg(roll),
  			ry: rad2deg(pitch),
  			rz: rad2deg(yaw),
  		};
  	}

  	/*
  	toAngles() {
  		const { x, y, z } = this.normalize();
  		return {
  			yaw: atan2(x, z),
  			pitch: atan2(y, sqrt(x ** 2 + z ** 2)),
  		};
  	}

  	toRotationMatrices() {
  		const { yaw, pitch } = this.toAngles();
  		const rmy = [ // rotation matrix for yaw (horizontal rotation around y-axis)
  			[cos(yaw), 0, -sin(yaw)],
  			[0, 1, 0],
  			[sin(yaw), 0, cos(yaw)],
  		];
  		const rmx = [
  			[1, 0, 0],
  			[0, cos(pitch), sin(pitch)],
  			[0, -sin(pitch), cos(pitch)],
  		];
  		return {
  			rmx,
  			rmy,
  			rmz: multiplyMatrices(rmy, rmx),
  		};
  	}

  	toRotations() {
  		const { rmx, rmy, rmz } = this.toRotationMatrices();
  		return {
  			rx: atan2(rmy[2][1], rmy[2][2]),
  			ry: atan2(-rmy[2][0], sqrt(
  				rmx[2][1] ** 2 + rmx[2][2] ** 2 
  			)),
  			rz: atan2(rmx[1][0], rmx[0][0]),
  		};
  	}

  	// Theta represents the rotation around the Y-axis,
  	// and phi represents the angle from the positive Z-axis.
  	toSpherical() {
  		const { x, y, z } = this;
  		const radius = this.length();
  		return {
  			radius,
  			theta: atan2(x, z),
  			phi: acos(y / radius),
  		};
  	}

  	// From https://gemini.google.com/app/98d37f6718cb75c3
  	getLookAtRotation(target, up = vec3(0, 1, 0)) {
  		const direction = vec3(target).sub(this).normalize();
  		console.log('--------\n\t', { ...direction });
  		// Handle zero-length direction (object already at target)
  		// No need to rotate if already facing target
  		if (direction.lengthSquared() === 0) return;
  		// Create orthogonal vector (assuming uniform scale) ???
  		// const right = vec3(up).cross(direction).normalize();
  		const right = direction.cross(up).normalize();
  		console.log('\tright:', { ...right });

  		// Create final up vector (completing the basis) ???
  		const finalUp = direction.cross(right).normalize();
  		// Construct rotation matrix (assuming uniform scale)
  		const rotationMatrix = new Float32Array([
  			right.x, right.y, right.z, 0,
  			finalUp.x, finalUp.y, finalUp.z, 0,
  			direction.x, direction.y, direction.z, 0,
  			0, 0, 0, 1,
  		]);
  		// Apply rotation matrix to object (assuming object has a rotation property)
  		// rotation.setFromRotationMatrix(rotationMatrix);
  		return Vector3.rotationMatrixToEuler(rotationMatrix);
  	}

  	static rotationMatrixToEuler(matrix = []) {
  		// Check matrix dimensions (should be 4x4)
  		// if (matrix.length !== 16) {
  		// 	console.error("Invalid matrix size. Expected 4x4 matrix.");
  		// 	return null;
  		// }
  		const m11 = matrix[0],
  			m12 = matrix[1],
  			m13 = matrix[2],
  			m21 = matrix[4],
  			m22 = matrix[5],
  			m23 = matrix[6],
  			m31 = matrix[8],
  			m32 = matrix[9],
  			m33 = matrix[10];
  		// Potential gimbal lock - check for close to -1 or 1 in m22
  		const epsilon = 0.000001;
  		if (abs(m22) > (1 - epsilon)) {
  			console.warn("Gimbal lock detected. Euler angles may be inaccurate.");
  			// Handle Gimbal Lock (choose one approach based on your needs)
  			// Option 1: Set one angle to zero (e.g., set x to zero)
  			// return { x: 0, y: atan2(m13, m33), z: atan2(m21, m23) };
  			// Other options: Use alternate calculation (https://www.euclideanspace.com/maths/rotations/conversions/matrixtoeuler.htm)
  		}
  		// Assuming no gimbal lock
  		return vec3(
  			atan2(-m31, m11), asin(m23), atan2(-m21, m22)
  		);
  	}
  	*/
  	  
  }

  function loop(n, fn) {
  	for (let i = 0; i < n; i += 1) { fn(i, n); }
  }
  const { sin, cos, PI: PI$1 } = Math;
  const TWO_PI = PI$1 * 2;

  function getXYCoordinatesFromPolar(angle, r) {
  	const x = r * Math.cos(angle);
  	const y = r * Math.sin(angle);
  	return { x, y };
  }

  function uid() { return String(Number(new Date())) + randInt(999); }

  function rotateByDegree(v, o) {
  	return v.rotate(deg2rad(o.rx), deg2rad(o.ry), deg2rad(o.rz));
  }

  function getDirectionUnit(o) {
  	const { facing } = o;
  	return rotateByDegree(vec3(facing), o);
  }

  function addAngles(a, b) {
  	let { rx, ry, rz } = a;
  	rx += b.rx;
  	ry += b.ry;
  	rz += b.rz;
  	return { rx, ry, rz };
  }

  const wait = (ms) => (new Promise((resolve) => setTimeout(resolve, ms)));

  // Some functions here from LittleJS utilities
  function clamp(value, min=0, max=1) { return value < min ? min : value > max ? max : value; }
  function lerp(percent, valueA, valueB) { return valueA + clamp(percent) * (valueB-valueA); }
  function rand(valueA=1, valueB=0) { return valueB + Math.random() * (valueA-valueB); }
  function randInt(valueA, valueB=0) { return Math.floor(rand(valueA,valueB)); }

  function pick(arr) { return arr[randInt(0, arr.length)];  }

  function makeCanvas(id, size) {
  	const existingElt = $id(id);
  	const elt = existingElt || doc.createElement('canvas');
  	elt.id = id;
  	elt.width = elt.height = size;
  	if (!existingElt) $id('loaded').appendChild(elt);
  	return [elt, elt.getContext('2d'), size / 2];
  }

  function makeStarFieldCanvas(id, gen) {
  	const size = 800;
  	const [cElt, c] = makeCanvas(id, size);
  	loop(1400, () => {
  		c.rect(gen.int(0, size), gen.int(0, size), 1, 1);
  	});
  	c.fillStyle = STAR_COLOR;
  	c.fill();
  	return cElt;
  }

  function makeStarCanvas(points = 4, color = '#f00', id, depth = .4, size = 600) {
  	const [cElt, c, h] = makeCanvas(id, size);
  	c.clearRect(0, 0, size, size);
  	const arr = [];
  	const a = TWO_PI / points;
  	const line = (a, r) => {
  		const { x, y } = getXYCoordinatesFromPolar(a, r);
  		arr.push([h + x, h + y]);
  	};
  	loop(points, (i) => {
  		line(a * i, h);
  		line(a * i + (a / 2), h * depth);
  	});
  	path(c, arr, color);
  	return cElt;
  }

  function path(c, arr, fillStyle, strokeArr) {
  	c.beginPath();
  	if (typeof arr === 'function') {
  		arr();
  	} else {
  		c.moveTo(...arr[0]);
  		arr.forEach((pts) => c.lineTo(...pts));
  	}
  	if (fillStyle) {
  		c.fillStyle = fillStyle;
  		c.fill();
  	}
  	if (strokeArr) {
  		c.strokeStyle = strokeArr[0]; // '#8bc7bf';
  		c.lineWidth = strokeArr[1];
  		c.stroke();
  	}
  	c.closePath();
  }

  function makeRabbit(front) {
  	const [cElt, c] = makeCanvas('rabbit' + front, 600);
  	c.beginPath();
  	c.moveTo(10, 600);
  	const points = [
  		[10, 600],
  		[50, 550],
  		[100, 520],
  		[270, 480],
  		[270, 450],
  		// [100, 410, 0, 0, 100],
  		// [80, 300],
  	];
  	points.forEach((pts) => c.lineTo(...pts));
  	points.reverse().forEach(([x, y]) => c.lineTo(600 - x, y));
  	c.fillStyle = RING_COLOR;
  	c.fill();
  	c.closePath();

  	const e = (x, y, radiusX, radiusY, rot = 0, color = '#eee', strokeArr) => {
  		path(c, () => {
  			c.ellipse(x, y, radiusX, radiusY, rot, 0, TWO_PI);
  		}, color, strokeArr);
  	};

  	if (front) {
  		// Neck
  		e(300, 400, 100, 160, 0, '#8bc7bf');
  	}
  	// Head
  	e(300, 300, 200, 70);
  	e(300, 350, 250, 100);
  	e(300, 410, 200, 60);
  	// Ears
  	e(150, 200, 200, 40, PI$1 * .4);
  	e(450, 200, 200, 40, -PI$1 * .4);
  	if (front) {
  		// Eyes
  		e(430, 320, 20, 30, 0, '#445');
  		e(170, 320, 20, 30, 0, '#445');
  		e(440, 290, 16, 40, PI$1 * -1.4, '#ccc');
  		e(160, 290, 16, 40, PI$1 * 1.4, '#ccc');
  		// Nose
  		e(300, 350, 20, 10, 0, '#de8b6f');

  		// Mouth
  		path(c, [[300, 450], [150, 400], [450, 400]], '#222');
  	}

  	// helmet 
  	e(300, 320, 290, 180, 0, '#ffffff55', ['#8bc7bf', 10]);

  	// $id('loaded').style.display = 'block';
  	// cElt.style.position = 'absolute';
  	// cElt.style.top = '0';
  	// cElt.style.left = '0';
  	// cElt.style.background = '#000';
  	// cElt.style.zIndex = '99';
  	return cElt;
  }

  function makeHopArmor(c1, c2) {
  	const [cElt, c] = makeCanvas(`hopArmor${c1}${c2}`, 50);
  	path(c, [[0,0], [0,50], [50,50], [50,0], [0,0]], c1, [c2, 6]);
  	path(c, [[10, 0], [10, 10], [40, 10], [40, 0]], null, [c2, 2]);
  	path(c, [[0, 30], [20, 30], [20, 40], [50, 40]], null, [c2, 2]);
  	return cElt;
  }

  // function makeCircle(color) {
  // 	const [cElt, c] = makeCanvas(`circle${color}`, 400);
  // 	path(c, () => {
  // 		c.arc(200, 200, 190, 0, TWO_PI);
  // 		// c.ellipse(200, 200, 190, 190, 0, 0, TWO_PI);
  // 	}, '#000', [color, 10]);
  // 	return cElt;
  // }

  function makeTextures() {
  	return {
  		tf: makeStarCanvas(9, STAR_COLOR, 'tf', .3),
  		plasma: makeStarCanvas(11, PLASMA_COLOR1, 'plasma', .2),
  		photon: makeStarCanvas(13, PLASMA_COLOR2, 'photon', .5),
  		klaxPlasma: makeStarCanvas(15, PLASMA_COLOR3, 'klaxPlasma', .3),
  		rabbit: makeRabbit(1),
  		pilot: makeRabbit(0),
  		scan: makeStarCanvas(8, PLASMA_COLOR3, 'scan', 1),
  	};
  }

  // Note that max distance is 1000
  // So world can be -500 --> 500 in any dimensions
  // Solar system is 30 trillion km diameter
  // so if the scale matches, then each 1.0 unit = 30 billion km

  const SHIP_SIZE = .3;
  const RING_RADIUS = 2000;
  const FAR = 30000;
  const SPACE_SIZE = FAR / 2; // The "radius" of the world
  const SCAN_SIZE = 120;

  // From LittleJS
  // https://github.com/KilledByAPixel/LittleJS/blob/main/build/littlejs.esm.js#L625C1-L657C2
  class RandomGenerator
  {
      /** Create a random number generator with the seed passed in
       *  @param {Number} seed - Starting seed */
      constructor(seed)
      {
          /** @property {Number} - random seed */
          this.seed = seed;
      }

      /** Returns a seeded random value between the two values passed in
      *  @param {Number} [valueA=1]
      *  @param {Number} [valueB=0]
      *  @return {Number} */
      rand(valueA=1, valueB=0)
      {
          // xorshift algorithm
          this.seed ^= this.seed << 13; 
          this.seed ^= this.seed >>> 17; 
          this.seed ^= this.seed << 5;
          return valueB + (valueA - valueB) * Math.abs(this.seed % 1e9) / 1e9;
      }

      /** Returns a floored seeded random value the two values passed in
      *  @param {Number} valueA
      *  @param {Number} [valueB=0]
      *  @return {Number} */
      int(valueA, valueB=0) { return Math.floor(this.rand(valueA, valueB)); }

      /** Randomly returns either -1 or 1 deterministically
      *  @return {Number} */
      sign() { return this.randInt(2) * 2 - 1; }
  }

  let W;
  let spin = 0;

  const PHYSICS_COLLIDABLE$1 = 1;
  const KLAX_COUNT = 6;
  const seed = 1234;
  const gen = new RandomGenerator(seed);

  const randCoord = (n = SPACE_SIZE) => gen.rand(-n, n);
  const randCoords = (n) => ({
  	x: randCoord(n),
  	y: randCoord(n),
  	z: randCoord(n),
  });

  // function addAxisCubes(g, size) {
  // 	W.cube({ n: g + 'axisX', g, x: size + 1, size, b: 'a008' });
  // 	W.cube({ n: g + 'axisY', g, y: size + 1, size, b: '0a08' });
  // 	W.cube({ n: g + 'axisZ', g, z: size + 1, size, b: '00a8' });
  // }

  const ship$1 = {
  	x: 0, y: 0, z: SPACE_SIZE * .5,
  	rx: -90, ry: 0, rz: 0,
  	vel: { x: 0, y: 0, z: 0 },
  	thrust: { x: 0, y: 0, z: 0 },
  	thrustForce: 0.05,
  	fireCooldown: 0,
  	r: 2, // collision radius
  	passType: 'ship',
  	passthru: ['plasma'],
  	sight: 1500,
  	aggro: 0,
  	thrustCooldown: 0,
  	trailCooldown: 0,
  	hp: 9,
  	maxHp: 9,
  	power: 100,
  	maxPower: 100,
  	recharge: .2,
  	weaponPowerUsage: 6,
  	shieldPower: 100,
  	enginePowerUsage: .4,
  	shields: 0,
  	shieldsDecayAmount: .4,
  	p: PHYSICS_COLLIDABLE$1, // is a physics object
  	ignition: 0, // size of ignite billboard
  	ignitionSize: .2,
  	facing: { x: 0, y: 1, z: 0 },
  	inv: { parts: 0 },
  	steerPercent: 0.05,
  	explodes: { colors: ['464040', '5796a1'], size: 1, count: 16 },
  };
  const klaxShip = {
  	...structuredClone(ship$1),
  	thrustForce: 0.008,
  	hp: 5,
  	passType: 'klaxShip',
  	passthru: ['klaxPlasma'],
  	facing: { x: 1, y: 0, z: 0 },
  	drops: ['parts'],
  	explodes: { colors: ['464040', '702782'], size: 5, count: 16 },
  	isKlax: 1,
  };
  const renderables$1 = {};

  function makeKlaxShip(i) {
  	const n = `k${i}`;
  	const b = KSHIP_COLOR1;
  	const pos = randCoords(RING_RADIUS);
  	// const pos = { x: 0, y: 0, z: 6000 };
  	const size = 5;
  	const coreSize = size / 2;
  	const strutSize = size / 2.5;
  	const k = {
  		n,
  		...structuredClone(klaxShip),
  		...pos, size: 5, r: 10,
  		isGroup: 1, // Identify this as a group in renderables
  	};
  	// console.log(k);
  	W.group({ n, g: 'system', ...pos });
  	const g = n;
  	const core = { g, size: coreSize, x: -1.5, b: KSHIP_COLOR2 };
  	const strut = { g, size: strutSize, b: KSHIP_COLOR1 };
  	W.cube({ ...core, n: n + 'c', rx: 45, b: KSHIP_COLOR1 });
  	loop(4, (i) => {
  		W.cube({ ...core, n: `${n}cc${i}`, x: -2 - i, size: 2.5 - (0.5 * i),
  			// rx: 45 + (i * 45),
  		});
  		// W.cube({ ...core, n: `${n}c${i}`, x: -2 - i, y: rand(-1, 1), z: rand(-1, 1), size: rand(2, 3),
  		// 	rx: rand(-10, 10), ry: rand(-10, 10), b: KSHIP_COLOR2 });
  	});
  	W.pyramid({ n: n + 'nose', rz: -90, g, size: 1.5, b: KSHIP_COLOR3 });
  	const arm = (i, o) => W.longRect({ ...strut, n: n + 'wing' + i, ...o });
  	arm(1, { y: 2, rx: 90, ry: 45, rz: -45, });
  	arm(2, { y: 2, x: 1.5, rx: 90, ry: 45, rz: 45, b });
  	arm(3, { y: -2, rx: 90, ry: 45, rz: 45, });
  	arm(4, { y: -2, x: 1.5, rx: 90, ry: 45, rz: -45, b });
  	W.simpleSphere({ n: n + 'shield', g, size: 10, b: 'ebd69404' });
  	// addAxisCubes(g, 4);
  	renderables$1[k.n] = k;
  }

  function makeStarSystem(Wparam, spaceSize, textures) {
  	W = Wparam;
  	// Groups and objects
  	const addGroup = (n, g) => {
  		const o = { n, rx: 0, ry: 0, rz: 0 };
  		if (g) o.g = g;
  		W.group(o);
  		// groups[n] = o;
  	};
  	addGroup('system');
  	['sun', 'ring', 'p1', 'p2', 'p3', 'a1', 'a2', 'a3'].forEach((n) => addGroup(n, 'system'));
  	['ship', 'skybox'].forEach((n) => W.group({ n })); // Are not in a group

  	const sunFlare = makeStarCanvas(16, `${SUN_COLOR}88`, 'sun', .7);


  	const shape = 'sphere';
  	const asteroid = { shape: 'simpleSphere', b: P1_COLOR };
  	[
  		{ shape, n: 'outerSun', g: 'sun', size: 500, b: `${SUN_COLOR}88` },
  		{ shape, n: 'innerSun', g: 'sun', size: 480, b: SUN_COLOR },
  		{ shape: 'billboard', n: 'sunFlare', g: 'sun', size: 640, b: SUN_COLOR, t: sunFlare },
  		{ shape, n: 'planet1', g: 'p1', ...getXYCoordinatesFromPolar(.5, 3000), size: 200, b: P1_COLOR, s:1 },
  		{ shape, n: 'planet2', g: 'p2', ...getXYCoordinatesFromPolar(.7, 4000), size: 120, b: P2_COLOR, s:1 },
  		{ shape, n: 'planet3', g: 'p3', ...getXYCoordinatesFromPolar(2, 7000), size: 80, b: P1_COLOR, s:1 },
  		{ ...asteroid, n: 'asteroid1', g: 'a1', ...getXYCoordinatesFromPolar(3, RING_RADIUS / 2), size: 30 },
  		{ ...asteroid, n: 'asteroid2', g: 'a2', ...getXYCoordinatesFromPolar(3.5, RING_RADIUS / 1.7), size: 35 },
  		{ ...asteroid, n: 'asteroid3', g: 'a3', ...getXYCoordinatesFromPolar(5, RING_RADIUS / 1.8), size: 40 },
  	].forEach((o) => {
  		W[o.shape](o);
  		renderables$1[o.n] = o;
  	});

  	{
  		const b = SPACE_COLOR;
  		const t = makeStarFieldCanvas('sf', gen);
  		[
  			{ z: -spaceSize, b, t },
  			{ y: -spaceSize, rx: -90, b, t },
  			{ y: spaceSize, rx: 90, b, t },
  			{ x: -spaceSize, ry: 90, b, t },
  			{ x: spaceSize, ry: -90, b, t },
  			{ z: spaceSize, rx: 180, b, t },
  		].forEach((settings, i) => {
  			W.plane({ b: '000', ...settings, n: `skybox${i}`, g: 'skybox', size: spaceSize * 2 });
  		});
  	}
  	{ // Build the Player's Ship
  		const b = SHIP_COLOR;
  		const engT = makeHopArmor(SHIP_COLOR2, '#7bb7af');
  		const t = makeHopArmor(b, '#478691');
  		const g = 'ship';
  		W.longPyramid({ n: 'shipBase', g, size: SHIP_SIZE * .6, y: SHIP_SIZE * .6, b, t });
  		W.ufo({ n: 'shipBody', g, y: SHIP_SIZE * -.2, rx: 90, size: SHIP_SIZE * 1.3, b, s:1 });
  		W.ufo({ n: 'sCockpit', g, y: SHIP_SIZE * -.2, rx: 90, z: SHIP_SIZE * .4, size: SHIP_SIZE * .5, b: `666c`, s:1 });
  		// W.billboard({ n: 'pilot', g, y: SHIP_SIZE * -.2, z: SHIP_SIZE * .6, rx: 90, size: SHIP_SIZE * .4, t: makeRabbit(0) });
  		const component = { n: 'shipComp1', g, x: SHIP_SIZE * -.3, y: -SHIP_SIZE * .7, ry: 0, rz: -90, size: SHIP_SIZE * .4, b, t };
  		W.cube(component);
  		W.cube({ ...component, n: 'shipComp2', rz: 90, x: -component.x });
  		const engX = SHIP_SIZE * 1.1;
  		const eng = { n: 'shipEngine1', g, ry: 45, rx: 90, x: engX, y: SHIP_SIZE * -.3, size: SHIP_SIZE, b: SHIP_COLOR2, t: engT };
  		W.longerRect(eng);
  		W.longerRect({ ...eng, n: 'shipEngine2', rz: 180, x: -engX });
  		const engBack = { n: 'shipEngineBack1', g,  x: engX, y: SHIP_SIZE * -1, size: SHIP_SIZE / 3, b }; 
  		W.longPyramid(engBack);
  		W.longPyramid({ ...engBack, n: 'shipEngineBack2', x: -engX });
  		const wing = { n: 'sWing1', g, rx: 90, ry: 90, x: -SHIP_SIZE * 0, y: SHIP_SIZE * -.3, z: SHIP_SIZE * 0, size: SHIP_SIZE * .1, b, t };
  		W.plank(wing);
  		const flame = { g, n: 'sFlame1', rx: 180, x: engX, y: SHIP_SIZE * -1.4, size: SHIP_SIZE * .26, b: FLAME_OFF_COLOR };
  		W.longPyramid(flame);
  		W.longPyramid({ ...flame, n: 'sFlame2', x: -engX });
  		const ignite = { g, y: SHIP_SIZE * -1.31, rx: 70, size: .2, t: textures.tf };
  		W.billboard({ ...ignite, n: 'sIgnite1', x: -SHIP_SIZE * 1.1  });
  		W.billboard({ ...ignite, n: 'sIgnite2', x: SHIP_SIZE * 1.1 });
  		// W.billboard({ ...ignite, n: 'sIgniteBack0', x: -SHIP_SIZE * 1.1, y: SHIP_SIZE * .6 });
  		// W.billboard({ ...ignite, n: 'sIgniteBack1', x: SHIP_SIZE * 1.1, y: SHIP_SIZE * .6 });
  		W.simpleSphere({ n: 'sShield', g, size: 1.2, b: 'de8b6f00', mode: 2, size: 0.01 });
  		
  		// addAxisCubes(g, 1);
  	}
  	
  	loop(KLAX_COUNT, makeKlaxShip);

  	const TWO_PI = Math.PI * 2;
  	loop(32, (i, n) => {
  		const angle = i === 0 ? 0 : (TWO_PI * i) / n;
  		const rz = rad2deg(angle);
  		let { x, y } = getXYCoordinatesFromPolar(angle, RING_RADIUS);
  		const g = `r${i}`;
  		// The ring segment (containing foundation and anything else put on it)
  		W.group({ n: g, g: 'ring' });
  		// The ring foundation
  		W.plank({
  			n: `ring${i}`,
  			g,
  			x,
  			y,
  			rz,
  			size: 20,
  			b: RING_COLOR,
  		});
  		// The ring "building"
  		W.cube({
  			n: `ringB${i}`,
  			g,
  			x,
  			y,
  			rz,
  			size: 50,
  			b: RING_COLOR2,
  		});
  	});
  	// Create litter / stardust
  	// loop(200, (i) => {
  	// 	W.billboard({
  	// 		n: `litter${i}`,
  	// 		g: 'system',
  	// 		...randCoords(RING_RADIUS * 1.5),
  	// 		size: 1,
  	// 		b: '555e',
  	// 	});
  	// });
  	// Create physical crates
  	loop(14, (i) => {
  		const b = pick(['de8b6f', '471b6e', '524bb3', '5796a1', '464040', '775b5b']);
  		const crate = {
  			n: `crate${i}`,
  			passType: 'crate',
  			passthru: ['crate'],
  			g: 'system',
  			...randCoords(RING_RADIUS * 1.5),
  			vel: { ...vec3() },
  			size: 20,
  			r: 20, // collision radius
  			b,
  			rx: rand(0, 359),
  			ry: rand(0, 359),
  			rz: rand(0, 359),
  			hp: 3,
  			drops: ['parts'],
  			explodes: { colors: ['464040', b], size: 2, count: 10 },
  			p: 1,
  		};
  		renderables$1[crate.n] = crate;
  		W.cube(crate);
  	});
  	return {
  		// groups,
  		ship: ship$1,
  		renderables: renderables$1,
  	};
  }

  function updateSystem(t) {
  	spin += t / 90;
  	return {
  		innerSun: { rx: spin, ry: spin * .9 },
  		p1: { rz: spin * 0.1 },
  		p2: { rz: spin * 0.15 },
  		p3: { rz: spin * 0.05 },
  		ring: { rz: spin * 0.5 },
  		a1: { rz: spin * .7 },
  		a2: { rz: spin * .6 },
  		a3: { rz: spin * .5 },
  	};
  }

  // Cube
  //
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |  x  | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  function addRect(name, { x = .5, y = .5, z = .5 } = {}) {
  	W$1.add(name, {
  		vertices: [
  			x, y, z,  -x, y, z,  -x,-y, z, // front
  			x, y, z,  -x,-y, z,   x,-y, z,
  			x, y,-z,   x, y, z,   x,-y, z, // right
  			x, y,-z,   x,-y, z,   x,-y,-z,
  			x, y,-z,  -x, y,-z,  -x, y, z, // up
  			x, y,-z,  -x, y, z,   x, y, z,
  			-x, y, z,  -x, y,-z,  -x,-y,-z, // left
  			-x, y, z,  -x,-y,-z,  -x,-y, z,
  			-x, y,-z,   x, y,-z,   x,-y,-z, // back
  			-x, y,-z,   x,-y,-z,  -x,-y,-z,
  			x,-y, z,  -x,-y, z,  -x,-y,-z, // down
  			x,-y, z,  -x,-y,-z,   x,-y,-z
  		],
  		uv: [
  			1, 1,   0, 1,   0, 0, // front
  			1, 1,   0, 0,   1, 0,            
  			1, 1,   0, 1,   0, 0, // right
  			1, 1,   0, 0,   1, 0, 
  			1, 1,   0, 1,   0, 0, // up
  			1, 1,   0, 0,   1, 0,
  			1, 1,   0, 1,   0, 0, // left
  			1, 1,   0, 0,   1, 0,
  			1, 1,   0, 1,   0, 0, // back
  			1, 1,   0, 0,   1, 0,
  			1, 1,   0, 1,   0, 0, // down
  			1, 1,   0, 0,   1, 0
  		]
  	});
  }

  // Pyramid
  //
  //      ^
  //     /\\
  //    // \ \
  //   /+-x-\-+
  //  //     \/
  //  +------+

  function addPyramid(name, { x = .5, y = .5, z = .5 } = {}) {
  	W$1.add(name, {
  		vertices: [
  			-x,-y, z,   x,-y, z,    0,  y,  0,  // Front
  			 x,-y, z,   x,-y,-z,    0,  y,  0,  // Right
  			 x,-y,-z,  -x,-y,-z,    0,  y,  0,  // Back
  			-x,-y,-z,  -x,-y, z,    0,  y,  0,  // Left
  			 x,-y, z,  -x,-y, z,   -x, -y, -z, // down
  			 x,-y, z,  -x,-y,-z,    x, -y, -z
  		],
  		uv: [
  			0, 0,   1, 0,  .5, 1,  // Front
  			0, 0,   1, 0,  .5, 1,  // Right
  			0, 0,   1, 0,  .5, 1,  // Back
  			0, 0,   1, 0,  .5, 1,  // Left
  			1, 1,   0, 1,   0, 0,  // down
  			1, 1,   0, 0,   1, 0
  		]
  	});
  }

  // Sphere
  //
  //          =   =
  //       =         =
  //      =           =
  //     =      x      =
  //      =           =
  //       =         =
  //          =   =

  function addSphere(name, { x = 2, y = 2, z = 2, precision = 20, i, ai, j, aj, p1, p2, vertices = [], indices = [], uv = []} = {}) { 
  	const { PI, sin, cos } = Math;
  	for(j = 0; j <= precision; j++){
  		aj = j * PI / precision;
  		for(i = 0; i <= precision; i++){
  			ai = i * 2 * PI / precision;
  			vertices.push(+(sin(ai) * sin(aj)/x).toFixed(6), +(cos(aj)/y).toFixed(6), +(cos(ai) * sin(aj)/z).toFixed(6));
  			uv.push((sin((i/precision))) * 3.5, -sin(j/precision));
  			if(i < precision && j < precision){
  			indices.push(p1 = j * (precision + 1) + i, p2 = p1 + (precision + 1), (p1 + 1), (p1 + 1), p2, (p2 + 1));
  			}
  		}
  	}
  	W$1.add(name, {vertices, uv, indices});
  }

  /*

  ZzFX - Zuper Zmall Zound Zynth v1.2.1 by Frank Force
  https://github.com/KilledByAPixel/ZzFX

  ZzFX Features

  - Tiny synth engine with 20 controllable parameters.
  - Play sounds via code, no need for sound assed files!
  - Compatible with most modern web browsers.
  - Small code footprint, the micro version is under 1 kilobyte.
  - Can produce a huge variety of sound effect types.
  - Sounds can be played with a short call. zzfx(...[,,,,.1,,,,9])
  - A small bit of randomness appied to sounds when played.
  - Use ZZFX.GetNote to get frequencies on a standard diatonic scale.
  - Sounds can be saved out as wav files for offline playback.
  - No additional libraries or dependencies are required.

  */
  /*

    ZzFX MIT License
    
    Copyright (c) 2019 - Frank Force
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    
  */


  // play a zzfx sound
  function zzfx(...parameters) { return ZZFX.play(...parameters) }

  // zzfx object with some extra functionalty
  const ZZFX =
  {
      // master volume scale
      volume: .3,
      
      // sample rate for audio
      sampleRate: 44100,
      
      // create shared audio context
      x: new AudioContext,

      // play a sound from zzfx paramerters
      play: function(...parameters)
      {
          // build samples and start sound
          return this.playSamples(this.buildSamples(...parameters));
      },

      // play an array of samples
      playSamples: function(...samples)
      {
          // create buffer and source
          const buffer = this.x.createBuffer(samples.length, samples[0].length, this.sampleRate),
              source = this.x.createBufferSource();

          samples.map((d,i)=> buffer.getChannelData(i).set(d));
          source.buffer = buffer;
          source.connect(this.x.destination);
          source.start();
          return source;
      },

      // build an array of samples
      buildSamples: function
      (
          volume = 1, 
          randomness = .05,
          frequency = 220,
          attack = 0,
          sustain = 0,
          release = .1,
          shape = 0,
          shapeCurve = 1,
          slide = 0, 
          deltaSlide = 0, 
          pitchJump = 0, 
          pitchJumpTime = 0, 
          repeatTime = 0, 
          noise = 0,
          modulation = 0,
          bitCrush = 0,
          delay = 0,
          sustainVolume = 1,
          decay = 0,
          tremolo = 0
      )
      {
          // init parameters
          let PI2 = Math.PI*2, sampleRate = this.sampleRate, sign = v => v>0?1:-1,
              startSlide = slide *= 500 * PI2 / sampleRate / sampleRate,
              startFrequency = frequency *= (1 + randomness*2*Math.random() - randomness) * PI2 / sampleRate,
              b=[], t=0, tm=0, i=0, j=1, r=0, c=0, s=0, f, length;

          // scale by sample rate
          attack = attack * sampleRate + 9; // minimum attack to prevent pop
          decay *= sampleRate;
          sustain *= sampleRate;
          release *= sampleRate;
          delay *= sampleRate;
          deltaSlide *= 500 * PI2 / sampleRate**3;
          modulation *= PI2 / sampleRate;
          pitchJump *= PI2 / sampleRate;
          pitchJumpTime *= sampleRate;
          repeatTime = repeatTime * sampleRate | 0;

          // generate waveform
          for(length = attack + decay + sustain + release + delay | 0;
              i < length; b[i++] = s)
          {
              if (!(++c%(bitCrush*100|0)))                      // bit crush
              { 
                  s = shape? shape>1? shape>2? shape>3?         // wave shape
                      Math.sin((t%PI2)**3) :                    // 4 noise
                      Math.max(Math.min(Math.tan(t),1),-1):     // 3 tan
                      1-(2*t/PI2%2+2)%2:                        // 2 saw
                      1-4*Math.abs(Math.round(t/PI2)-t/PI2):    // 1 triangle
                      Math.sin(t);                              // 0 sin

                  s = (repeatTime ?
                          1 - tremolo + tremolo*Math.sin(PI2*i/repeatTime) // tremolo
                          : 1) *
                      sign(s)*(Math.abs(s)**shapeCurve) *       // curve 0=square, 2=pointy
                      volume * this.volume * (                  // envelope
                      i < attack ? i/attack :                   // attack
                      i < attack + decay ?                      // decay
                      1-((i-attack)/decay)*(1-sustainVolume) :  // decay falloff
                      i < attack  + decay + sustain ?           // sustain
                      sustainVolume :                           // sustain volume
                      i < length - delay ?                      // release
                      (length - i - delay)/release *            // release falloff
                      sustainVolume :                           // release volume
                      0);                                       // post release

                  s = delay ? s/2 + (delay > i ? 0 :            // delay
                      (i<length-delay? 1 : (length-i)/delay) *  // release delay 
                      b[i-delay|0]/2) : s;                      // sample delay
              }

              f = (frequency += slide += deltaSlide) *          // frequency
                  Math.cos(modulation*tm++);                    // modulation
              t += f - f*noise*(1 - (Math.sin(i)+1)*1e9%2);     // noise

              if (j && ++j > pitchJumpTime)          // pitch jump
              {
                  frequency += pitchJump;            // apply pitch jump
                  startFrequency += pitchJump;       // also apply to start
                  j = 0;                             // stop pitch jump time
              }

              if (repeatTime && !(++r % repeatTime)) // repeat
              {
                  frequency = startFrequency;        // reset frequency
                  slide = startSlide;                // reset slide
                  j = j || 1;                        // reset pitch jump time
              }
          }

          return b;
      },
      
      // get frequency of a musical note on a diatonic scale
      getNote: function(semitoneOffset=0, rootNoteFrequency=440)
      {
          return rootNoteFrequency * 2**(semitoneOffset/12);
      }

  }; // ZZFX

  const { min, max, PI, round, abs, floor } = Math;

  const g = {
  	W: W$1,
  	input,
  	paused: 0,
  	trail: 0,
  	nextEnter: 0,
  	ogKlaxShipCount: 0,
  	klaxShipLeft: 0,
  	start() { this.i = setInterval(update, t); },
  	stop() { clearInterval(this.i); },
  	tick: 0,
  };
  let sys;
  let textures = {};
  const MAX_PARTS = 7;
  const MAX_VEL = 800;
  const VEL_FRICTION = .25; // Friction per tick (0.016)
  const PHYSICS_COLLIDABLE = 1, PHYSICS_NON_COLLIDABLE = 2;

  // const sun = { rx: 0, ry: 0, ry: 0 };

  const t = 1000 / 60;
  const camOffset = { back: -SHIP_SIZE * 5, up: SHIP_SIZE * 2, rx: 80, ry: 0, rz: 0, zoom: 1 };
  const cam = { fov: 30, targetFov: 30, lastFov: 31, aspect: 1, near: 0.5, far: FAR };
  const STEER_X_MIN = -90 - 90;
  const STEER_X_MAX = -90 + 90;
  const steer = { rx: -90, ry: 0, rz: 0 };

  const achievements = [
  	'Check steering: [Tab] to toggle mouse-lock', // 0
  	'Scan: Hold [C]', // 1
  	'Thrusters: [W] and [S]', // 2
  	'Fire weapons: [Click], [F], or [R]', // 3
  	'Boost: Hold [Shift] with [W] or [S]', // 4
  	'Shields: [Space]', // 5
  	'Klaxonian Ships Destroyed: {K} / {S}', // 6
  	'Ring Repair Parts: {P} / {M}', // 7
  ].map((t) => ({ t, done: 0 }));

  function achieve(i) {
  	if (i !== undefined) {
  		if (achievements[i].done) return;
  		achievements[i].done = 1;
  	}
  	const kills = g.ogKlaxShipCount - g.klaxShipLeft;
  	if (g.klaxShipLeft <= 0) achievements[6].done = 1;
  	if ((ship.inv.parts || 0) >= MAX_PARTS) achievements[7].done = 1;
  	updateAchievements(kills);
  	if (achievements.length === achievements.filter((a) => a.done).length) {
  		dialog('You did it! With those parts we should be able to get the Ring powered up again.<p>Thank you!</p><p>(Refresh page to play again.)');
  	}
  }

  function updateAchievements(kills) {
  	const html = achievements.map(
  		({ t, done }) => `<li class="${ done ? 'done' : ''}">${
			t.replace('{K}', kills)
				.replace('{S}', g.ogKlaxShipCount)
				.replace('{P}', ship.inv.parts || 0)
				.replace('{M}', MAX_PARTS)
		}</li>`,
  	).join('');
  	$html('goals', html);
  }

  function gameOver() {
  	g.paused = 1;
  	input.unlock();
  	$('main').classList.add('end');
  	$id('end').style.display = 'flex';
  }

  function title() {
  	g.paused = 1;
  	W$1.camera({ x: 0, y: 0, z: 0, rx: -13 });
  	$id('hi').style.display = 'flex';
  	g.nextEnter = () => titleDone();
  }

  function titleDone() {
  	$id('hi').style.display = 'none';
  	return dialog(
  		`<p>A Star-Hopper ship! You heard our distress call? 📡 We're under attack by a Klaxonian fleet!
		They've disabled our defenses and solar farms.</p>`
  		+ `<p>The entire sector is dependent on the POWER generated by our Bunson Ring. ⚡`
  		+ `Please rescue us and help get the Ring operational again.</p>`
  	);
  }

  function setupCanvasSize(c) {
  	const w = c.clientWidth;
  	const h = c.clientHeight;
  	if (w > h) {
  		cam.aspect = w/h;
  		c.height = min(w, 800);
  		c.width = w / cam.aspect;
  	} else {
  		// Make it square
  		c.width = c.height = min(w, 800);
  		cam.aspect = 1;
  	}
  	// const minDim = max(min(ogW, ogH), 800);
  	// const aspect = ogW / ogH;
  	// c.width = minDim * aspect;
  	// c.height = minDim * aspect;
  	// console.log(aspect, ogW, ogH, c.width, c.height);
  	// cam.aspect = aspect;
  }

  function dialog(text) {
  	zzfx(...[2.36,0,130.8128,.02,.51,.2,,1.91,,,,,.08,,,,.04,.5,,.39]);
  	g.paused = 1;
  	const c = $id('dialog').classList;
  	const s = $id('goals').style;
  	s.opacity = '0';
  	input.unlock();
  	// console.log(textures.rabbit);
  	$html('pic', `<img src="${textures.rabbit.toDataURL()}" />`);
  	$html('txt', text + '<i data-key="Enter">Close [Enter]</i>');
  	c.add('show');
  	W$1.camera({ x: 0, y: 100, z: 0, a: 200 }, 500);
  	W$1.move({ n: 'system', x: 1000, y: -500, z: -2500, a: 2000 }, 500);
  	return g.nextEnter = () => {
  		zzfx(...[.5,,259,.02,.02,.01,2,.19,,,-48,.01,,,3.4,.8,,.13,.01]);
  		s.opacity = '1';
  		c.remove('show');
  		g.paused = 0;
  		$('main').classList.remove('ui--off');
  	};
  }


  function setup() {
  	const c = $id('canvas');
  	setupCanvasSize(c);
  	input.setup({
  		lockElt: c,
  		keys: {
  			Tab: () => { achieve(0); input.toggleLock(); },
  			p: () => { g.paused = !g.paused; },
  			t: () => { g.trail = !g.trail; },
  			Enter: () => {
  				if (g.nextEnter) g.nextEnter = g.nextEnter();
  			},
  		}
  	});
  	textures = makeTextures();

  	c.addEventListener('click', () => {
  		input.lock();
  	});
  	W$1.reset(c);
  	W$1.clearColor(BG_COLOR);
  	// W.camera({ z: 5000 });
  	W$1.light({ x: -1, y: -1.2, z: .2 }); // Set light direction: vector direction x, y, z
  	W$1.ambient(0.8); // Set ambient light's force (between 0 and 1)
  	// New shapes
  	addRect('plank', { y: 10, z: 5, x: .3 });
  	addRect('longRect', { x: 0.2, y: 0.2 });
  	addRect('longerRect', { x: 0.2, y: 0.2, z: .7 });
  	addRect('cube');
  	addPyramid('pyramid');
  	addPyramid('longPyramid', { y: .8 });
  	addSphere('sphere');
  	addSphere('simpleSphere', { precision: 6 });
  	addSphere('ufo', { y: 3, precision: 10 });
  	// addRect('rect', { y: 1 });

  	sys = makeStarSystem(W$1, SPACE_SIZE, textures);
  	['renderables', 'ship'].forEach((k) => {
  		window[k] = sys[k];
  		g[k] = sys[k];
  	});

  	const ks = Object.entries(renderables).filter(([,o]) => o.isKlax);
  	ks.forEach(([,o], i) => {
  		if (o.isKlax) {
  			const n = `scan${i}`;
  			const scan = { n, g: 'system', x: o.x, y: o.y, z: o.z, size: SCAN_SIZE, t: textures.scan };
  			renderables[n] = scan;
  			W$1.billboard(scan);
  		}
  	});
  	g.ogKlaxShipCount = g.klaxShipLeft = ks.length;
  	achieve();
  }

  function thrust(o, amount = 0) {
  	const { x, y, z } = getDirectionUnit(o).scale(amount);
  	o.thrust = { x, y, z};
  }

  function outOfBounds(o) {
  	const boundDirs = ['x', 'y', 'z'].filter((a) => o[a] >= SPACE_SIZE || o[a] <= -SPACE_SIZE);
  	return boundDirs.length > 0;
  }

  function physics(o, sec) {
  	// If no thrust then apply friction (unrealistic in space? let's blame it on lots of star dust)
  	let { friction = 1 } = o;
  	friction *= VEL_FRICTION;
  	if (outOfBounds(o)) friction *= 10;
  	// const friction = (typeof o.friction === 'number') ? VEL_FRICTION * o.friction : VEL_FRICTION;
  	const velVector = vec3(o.vel);
  	const F = vec3(o.thrust || undefined);
  	const acc = F.scale(1 / (o.mass || 1));
  	o.vel = velVector
  		.sub(velVector.normalize(friction)) // friction is an acceleration of sorts, not mass dependent
  		.add(acc.scale(1/sec)); // add acceleration per time
  	const spd = o.vel.length();
  	if (spd > MAX_VEL) o.vel = o.vel.normalize(MAX_VEL);
  	else if (spd < 0.0001) o.vel = vec3();
  	['x', 'y', 'z'].forEach((a) => {
  		// This "* sec" calculation seems wrong but don't want to mess with it right now
  		o[a] = clamp(o[a] + o.vel[a] * sec, -SPACE_SIZE, SPACE_SIZE);
  		if (outOfBounds(o)) {
  			if (o.decay) o.decay = 0;
  			// console.log(o.n, 'edge');
  		}
  	});
  }

  function dmg(a, b) { // a = attacker, b = defender
  	if (a.damage && b.hp) {
  		const isShipHurt = (b === ship);
  		const shieldPercent = clamp((b.shields || 0) / 100, 0, 1);
  		b.hp -= (a.damage * (1 - shieldPercent));
  		// console.log('Shield %', shieldPercent, '\n', b);
  		if (a.destroyOnDamage) a.decay = 0;
  		if (b.hp <= 0) {
  			// console.log('Destroy', b.n);
  			b.decay = 0;
  			if (b.drops) {
  				b.drops.forEach((drop) => ship.inv[drop] = (ship.inv[drop] || 0) + 1);
  			}
  			if (b.explodes) spawnExplosion(b, b.explodes);
  		} else {
  			spawnExplosion({ x: b.x, y: b.y, z: b.z }, { count: 8 });
  		}
  		const vol = isShipHurt ? 1.5 : .7;
  		zzfx(...[vol,,416,.02,.21,.52,4,2.14,.2,,,,,1.7,,.9,,.44,.12,.23]);
  		if (isShipHurt) flashBorder('canvas');
  	}
  	a.aggro += 1;
  	b.aggro += 1;
  }
  function collide(e1, e2, dist) {
  	// Set flags
  	e1.collided = e2;
  	e2.collided = e1;
  	// Damage
  	dmg(e1, e2);
  	dmg(e2, e1);
  	// Un-overlap
  	const collisionVector = vec3(e2).sub(e1).normalize();
  	const overlap = e1.r + e2.r - dist;
  	// Move each sphere back by half the overlap
  	const reverseOverlapVector = collisionVector.scale(overlap / 2);
  	vec3(e1).sub(reverseOverlapVector).copyTo(e1);
  	vec3(e2).add(reverseOverlapVector).copyTo(e2);
  	// Set new velocities
  	['x', 'y', 'z'].forEach((a) => {
  		const m1 = e1.mass || 1;
  		const m2 = e2.mass || 1;
  		const tm = m1 + m2; // total mass
  		const v1 = e1.vel[a];
  		const v2 = e2.vel[a];
  		// From https://en.wikipedia.org/wiki/Elastic_collision#Equations
  		e1.vel[a] = (
  			((m1 - m2) / tm) * v1
  			+ ((2 * m2) / tm) * v2
  		) * 1; // restitution
  		e2.vel[a] = (
  			((2 * m1) / tm) * v1
  			+ ((m2 - m1) / tm) * v2
  		) * 1;
  		// console.log(a, 'before', v1, v2, '\nafter', e1.vel[a], e2.vel[a]);
  	});
  }

  function pass(a, b) {
  	return (a.p !== PHYSICS_COLLIDABLE || b.p !== PHYSICS_COLLIDABLE
  		|| (a.passthru && a.passthru.includes(b.passType)));
  }

  function checkCollision(e1, ents) {
  	if (e1.collided || e1.p !== PHYSICS_COLLIDABLE) return;
  	loop(ents.length, (w) => {
  		const e2 = ents[w];
  		if (pass(e1, e2) || pass(e2, e1) || e1 === e2)  return;
  		if (e2.collided) return;
  		const d = vec3(e1).distance(e2);
  		if (d <= (e1.r + e2.r)) collide(e1, e2, d);
  	});
  }

  function cool(o, prop, sec) {
  	o[prop] = max(o[prop] - sec, 0);
  }

  function steerRotation(o, steer, strafe = 0) {
  	const { steerPercent = 0.01 } = o;
  	['rx', 'ry', 'rz'].forEach((k) => o[k] = lerp(steerPercent, o[k], steer[k]));
  	// console.log(o.ry, strafe, o.ry + strafe, steer.ry);
  	if (strafe) o.ry = lerp(0.1, o.ry, steer.ry + strafe);
  }

  function updateKlaxShip(k, sec) {
  	if (k.decay <= 0 || k.hp <= 0) {
  		// console.warn('destroyed ship');
  		return;
  	}
  	const pos = vec3(k);
  	const dist = pos.distance(ship);
  	if (dist > k.sight * 2) k.aggro = max(0, k.aggro -= 0.1);
  	else if (dist <= k.sight) k.aggro = max(1, k.aggro);
  	if (!k.aggro) return;
  	// Aggro actions
  	const steer = pos.toWAngles(ship);
  	steerRotation(k, steer);
  	// k.rx = lerp(0.01, k.rx, rx);
  	// k.ry = lerp(0.01, k.ry, ry);
  	// k.rz = lerp(0.01, k.rz, rz);
  	if (k.thrustCooldown) {
  		cool(k, 'thrustCooldown', sec);
  	} else {
  		thrust(k, k.thrustForce);
  		k.thrustCooldown = rand(.5, 1);
  	}
  	if (k.fireCooldown) {
  		cool(k, 'fireCooldown', sec);
  	} else {
  		spawnPlasma('klaxPlasma', k, 'klaxPlasma', ['klaxShip', 'klaxPlasma', 'plasma']);
  		k.fireCooldown = rand(0.3, 3);
  	}
  }

  const basePlasmaThrustScale = .001;
  const PROJECTILE_TYPES = {
  	plasma: { vScale: 45, tScale: basePlasmaThrustScale * 4, damage: 1, size: 2,
  		sound: [,.1,295,.02,.01,.08,,1.72,-3.5,.2,,,,.2,,,.08,.62,.09] },
  	photon: { vScale: 25, tScale: basePlasmaThrustScale * 1.2, damage: 3, size: 2,
  		sound: [2.06,.35,212,.05,.08,.01,,1.66,-4.8,.2,50,,,1.7,,.5,.28,.65,.02] },
  	klaxPlasma: { vScale: 45, tScale: basePlasmaThrustScale * 2, damage: 1, size: 10,
  		sound: [.3,.4,241,.04,.03,.08,,.46,-7.7,,,,,,,.2,,.53,.05,.2],
  	},
  };

  function spawnPlasma(typeKey, from, passType, passthru) {
  	const { vScale, tScale, damage, size, sound } = PROJECTILE_TYPES[typeKey];
  	// if (tScale < VEL_FRICTION) console.warn('Not enough thrust to overcome friction');
  	const t = textures[typeKey];
  	const u = getDirectionUnit(from);
  	const { x, y, z } = vec3(from).add(u.normalize(from.size));
  	const v = u.scale(vScale).add(from.vel);
  	zzfx(...sound);
  	const plasma = {
  		n: typeKey + passType + uid(),
  		g: 'system',
  		passType,
  		x, y, z,
  		vel: { ...v },
  		thrust: { ...u.scale(tScale) },
  		// friction: 0,
  		decay: 5,
  		damage,
  		r: 5,
  		passthru,
  		mass: 0.01,
  		size,
  		destroyOnDamage: 1,
  		p: PHYSICS_COLLIDABLE,
  	};
  	renderables[plasma.n] = plasma;
  	W$1.billboard({ ...plasma, t });
  }

  function spawnExplosion(where, explodes) {
  	let { x, y, z } = where;
  	const {
  		count = 20, size = 2, colors = ['464040', 'de8b6f', 'b0455a'], maxDecay = 10
  	} = explodes || where.explodes || {};
  	// console.log('Exploding for', where.n, count);
  	loop(count, () => {
  		const vel = vec3(where.vel || { x: 0, y: 0, z: 0 });
  		['x', 'y', 'z'].forEach((w) => {
  			vel[w] += rand(-20, 20);
  		});
  		const explosion = {
  			n: `explosion${uid()}`,
  			x: x + rand(-.5, .5),
  			y: y + rand(-.5, .5),
  			z: z + rand(-.5, .5),
  			vel,
  			decay: rand(1, maxDecay),
  			r: 1,
  			g: 'system',
  			size: max(size + rand(-size/2, size/2), .2),
  			passType: 'dust',
  			passthru: ['dust'],
  			mass: 0.01,
  			b: pick(colors),
  			destroyOnDamage: 1,
  			p: PHYSICS_NON_COLLIDABLE,
  		};
  		renderables[explosion.n] = explosion;
  		W$1.billboard({ ...explosion });
  	});
  }

  function spawnTrail(o, sec) {
  	if (o.trailCooldown) {
  		cool(o, 'trailCooldown', sec);
  		return;
  	}
  	ship.trailCooldown = 0.1;
  	if (vec3(o.vel).length() === 0) return;
  	const { x, y, z } = o;
  	const trail = {
  		n: `${o.n}trail${uid()}`,
  		x, y, z,
  		decay: 10,
  		g: 'system',
  		size: rand(.1, .3),
  		b: '7666',
  	};
  	renderables[trail.n] = trail;
  	W$1.billboard({ ...trail });
  }

  function htmlLine(n, m) {
  	let h = '';
  	loop(Math.floor((n/m) * 10), () => h += '-');
  	return h;
  }

  function updateUI() {
  	const v = vec3(ship.vel);
  	const dir = (v.x > v.y && v.x > v.z) ? 'X' : (
  		(v.y > v.x && v.y > v.z) ? 'Y' : 'Z'
  	);
  	const spd = v.length();
  	const html = (g.paused ? '<b>Paused</b>' : '') + '<b>' + [
  		`Velocity: ${round(spd)} (${dir}) ${htmlLine(spd, MAX_VEL)}`,
  		// `Pitch: ${round(steer.rx + 90)}, Yaw: ${round(steer.ry) % 360}`,
  		`Power: ${floor(ship.power)} ${htmlLine(ship.power, ship.maxPower)}`,
  		`Shields: ${floor(ship.shields)} ${htmlLine(ship.shields, 100)}`,
  		`Hull: ${floor(ship.hp * 10) / 10} ${htmlLine(ship.hp, ship.maxHp)}`,
  	].join('</b><b>') + '</b>';
  	$html('si', html);
  }

  function zoom(n) {
  	camOffset.zoom = clamp(camOffset.zoom + n, 0, 100);
  }

  function playDud() {
  	zzfx(...[.5,,144,.01,.04,.17,1,.77,,,-119,.09,,,31,.1,,.84,.03,.06]);
  }

  function update() {
  	if (g.paused) return;
  	g.tick++;
  	if (g.tick > 100000) g.tick = 0;
  	const sec = t / 1000;

  	// Handle inputs and update player ship
  	const { down } = input;
  	if (down[']']) cam.targetFov += .5;
  	if (down['[']) cam.targetFov -= .5;
  	const wheel = input.getWheel();
  	if (down['-'] || wheel > 0) zoom(.1);
  	if (down['='] || down['+'] || wheel < 0) zoom(-.1);
  	if (down.p) return;
  	const strafe = (down.a) ? 90 : (down.d ? -90 : 0);

  	const boost = down.Shift ? 2 : 1;
  	let thrustAmount = 0; 
  	if (boost > 1) achieve(4);
  	if (ship.power <= 0) ; else if (down.s) {
  		thrustAmount = ship.thrustForce * boost * -.5;
  		down.w = 0;
  	} else if (down.w) {
  		thrustAmount = ship.thrustForce * boost;
  	}
  	thrust(ship, thrustAmount);
  	{
  		const flameColor = (thrustAmount > 0) ? FLAME_ON_COLOR : FLAME_OFF_COLOR;
  		W$1.move({ n: 'sFlame1', b: flameColor });
  		W$1.move({ n: 'sFlame2', b: flameColor });
  		ship.ignition = lerp(0.2, ship.ignition, (thrustAmount) ? ship.ignitionSize : 0.0001);
  		W$1.move({ n: 'sIgnite1', size: ship.ignition, y: SHIP_SIZE * (thrustAmount < 0 ? .6 : -1.31) });
  		W$1.move({ n: 'sIgnite2', size: ship.ignition, y: SHIP_SIZE * (thrustAmount < 0 ? .6 : -1.31)  });
  	}
  	if (thrustAmount) {
  		ship.power -= ship.enginePowerUsage;
  		const vol = (boost > 1) ? .15 : .1;
  		const bitCrush = (boost > 1) ? .2 : .8;
  		zzfx(...[vol,,794,.02,.3,.32,,3.96,,.7,,,.16,2.1,,bitCrush,.1,.31,.27]);
  		achieve(2);
  	}
  	
  	const click = input.getClick();
  	if (ship.fireCooldown === 0	&& (down.f || down.r || (click && click.locked))) {
  		achieve(3);
  		if (ship.power < ship.weaponPowerUsage) {
  			playDud();
  		} else {
  			ship.power -= ship.weaponPowerUsage;
  			spawnPlasma(
  				(click && click.right || down.r) ? 'photon' : 'plasma',
  				ship,
  				'plasma',
  				['ship', 'plasma', 'klaxPlasma'],
  			);
  			ship.fireCooldown = 0.3;
  		}
  	}
  	if (down[' ']) {
  		if (ship.power > 12) { // min power needed to power shields
  			const chargeUp = min(ship.power, ship.shieldPower - ship.shields);
  			ship.shields += chargeUp;
  			ship.power -= chargeUp;
  			zzfx(...[.4,,99,,.23,.12,3,1.07,,5,,,.06,,,1,,.7,.24,.32]);
  			achieve(5);
  		} else playDud();
  	}
  	// For testing
  	if (down.y) spawnExplosion(ship, ship.explodes);
  	// Scan (animations happen below)
  	if (down.c) achieve(1); 

  	// Get arrays of physics entities and enemy ships
  	const physicsEnts = [ship];
  	const klaxShips = [];
  	Object.entries(renderables).forEach(([,o]) => {
  		if (o.p) physicsEnts.push(o);
  		if (o.isKlax) klaxShips.push(o);
  	});
  	g.klaxShipLeft = klaxShips.length;

  	// Do enemy thrust, rotation, cooldowns, and AI
  	klaxShips.forEach((k, i) => {
  		updateKlaxShip(k, sec);
  		// Update scan
  		const scan = (down.c && k.hp > 0) ? {
  			x: k.x, y: k.y, z: k.z,
  			size: 110, b: SCAN_COLOR,
  		} : {
  			size: .1, b: '0000',
  		};
  		renderables[`scan${i}`] = { ...renderables[`scan${i}`], ...scan };
  	});

  	// Do collisions
  	loop(physicsEnts.length, (i) => checkCollision(physicsEnts[i], physicsEnts));
  	// Do physics, and clear collided flag
  	physicsEnts.forEach((o) => {
  		o.collided = 0;
  		physics(o, sec);
  	});

  	// Player cool down and recharge
  	ship.fireCooldown = max(ship.fireCooldown - sec, 0);
  	ship.power = min(ship.maxPower, ship.power + ship.recharge);
  	ship.shields = max(0, ship.shields - ship.shieldsDecayAmount);

  	// Check for player death
  	if (ship.hp <= 0) {
  		ship.size = .01;
  		spawnExplosion(ship);
  		(async () => {
  			await wait(1500);
  			return gameOver();
  		})();
  	}
  	
  	
  	// Player Ship Steering
  	{
  		// const { ry, rx } = steer;
  		const lockMove = input.getLockMove();
  		// if (lockMove.x || lockMove.y) console.log(lockMove);
  		steer.ry -= lockMove.x / 10;
  		steer.rx = min(max(steer.rx - lockMove.y / 10, STEER_X_MIN), STEER_X_MAX);
  		// steer.rz += down.a ? -2 : (down.d ? 2 : 0);
  		// console.log({ ...steer });
  		steerRotation(ship, steer, strafe);
  	}
  	{
  		const unit = rotateByDegree(
  			vec3(0, camOffset.back, camOffset.up).scale(camOffset.zoom), steer);
  		// TODO: only add cam if fov or aspect ratio has changed
  		const speedFov = (!thrustAmount) ? 0 : (
  			thrustAmount < 0 ? -2 : (
  				(boost > 1) ? 10 : 1
  			)
  		);
  		cam.fov = lerp(0.1, cam.fov, cam.targetFov + speedFov);
  		const fovChanged = abs(cam.fov - cam.lastFov) > 0.001;
  		cam.lastFov = cam.fov;
  		let camSettings = { ...unit, ...addAngles(camOffset, steer), a: t };
  		if (fovChanged) camSettings = { ...camSettings, ...cam };
  		W$1.camera(camSettings);
  	}

  	if (g.trail) spawnTrail(ship, sec);

  	// Decay
  	// Note: This has to be done towards the end because we're not removing the objects from the
  	// physics array or klax ship array
  	Object.keys(renderables).forEach((k) => {
  		const p = renderables[k];
  		if (typeof p.decay === 'number') {
  			p.decay -= sec;
  			if (p.decay <= 0) {
  				if (p.isGroup) {
  					// We don't know the group's children, so we can't just delete the group
  					// otherwise the children will still get rendered
  					W$1.move({ n: p.n, x: FAR * 2 });
  				} else {
  					W$1.delete(p.n);
  				}
  				delete renderables[k];
  				achieve();
  			}
  		}
  	});

  	// Animate the system and renderables
  	const shieldOp = clamp(ship.shields, 10, 99);
  	W$1.move({ n: 'sShield', b: `de8b6f${shieldOp}`, size: ship.shields ? 1.2 : 0.01, a: 100 });
  	const allMovingThings = {
  		ship: { ...ship, x: 0, y: 0, z: 0 },
  		...renderables,
  		system: { x: -ship.x, y: -ship.y, z: -ship.z, a: t },
  		...updateSystem(t),
  	};
  	Object.keys(allMovingThings).forEach((key) => {
  		W$1.move({ n: key, ...allMovingThings[key], a: t }, 0);
  	});

  	if (g.tick % 4 === 0) updateUI();
  }

  addEventListener('DOMContentLoaded', async () => {
  	setup();
  	await wait(30);
  	update();
  	await wait(30);
  	title();
  	// titleDone();
  	g.start();
  });

  window.g = g;

})();
