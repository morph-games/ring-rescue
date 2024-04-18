(function () {
  'use strict';

  // WebGL framework
  // ===============

  let t$1,
  W = {
    
    // List of 3D models that can be rendered by the framework
    // (See the end of the file for built-in models: plane, billboard, cube, pyramid...)
    models: {},
    
    // List of custom renderers
    //renderers: {},

    // Reset the framework
    // param: a <canvas> element
    reset: canvas => {
      
      // Globals
      W.canvas = canvas;    // canvas element
      W.objs = 0;           // Object counter
      W.current = {};       // Objects current states
      W.next = {};          // Objects next states
      W.textures = {};      // Textures list

      // WebGL context
      W.gl = canvas.getContext('webgl2');
      
      // Default blending method for transparent objects
      W.gl.blendFunc(770 /* SRC_ALPHA */, 771 /* ONE_MINUS_SRC_ALPHA */);
      
      // Enable texture 0
      W.gl.activeTexture(33984 /* TEXTURE0 */);

      // Create a WebGL program
      W.program = W.gl.createProgram();
      
      // Hide polygons back-faces (optional)
      W.gl.enable(2884 /* CULL_FACE */);
      
      // Create a Vertex shader
      // (this GLSL program is called for every vertex of the scene)
      W.gl.shaderSource(
        
        t$1 = W.gl.createShader(35633 /* VERTEX_SHADER */),
        
        `#version 300 es
      precision highp float;                        // Set default float precision
      in vec4 pos, col, uv, normal;                 // Vertex attributes: position, color, texture coordinates, normal (if any)
      uniform mat4 pv, eye, m, im;                  // Uniform transformation matrices: projection * view, eye, model, inverse model
      uniform vec4 bb;                              // If the current shape is a billboard: bb = [w, h, 1.0, 0.0]
      out vec4 v_pos, v_col, v_uv, v_normal;        // Varyings sent to the fragment shader: position, color, texture coordinates, normal (if any)
      void main() {                                 
        gl_Position = pv * (                        // Set vertex position: p * v * v_pos
          v_pos = bb.z > 0.                         // Set v_pos varying:
          ? m[3] + eye * (pos * bb)                 // Billboards always face the camera:  p * v * distance + eye * (position * [w, h, 1.0, 0.0])
          : m * pos                                 // Other objects rotate normally:      p * v * m * position
        );                                          
        v_col = col;                                // Set varyings 
        v_uv = uv;
        v_normal = transpose(inverse(m)) * normal;  // recompute normals to match model thansformation
      }`
      );
      
      // Compile the Vertex shader and attach it to the program
      W.gl.compileShader(t$1);
      W.gl.attachShader(W.program, t$1);
      console.log('vertex shader:', W.gl.getShaderInfoLog(t$1) || 'OK');
      
      // Create a Fragment shader
      // (This GLSL program is called for every fragment (pixel) of the scene)
      W.gl.shaderSource(

        t$1 = W.gl.createShader(35632 /* FRAGMENT_SHADER */),
        
        `#version 300 es
      precision highp float;                  // Set default float precision
      in vec4 v_pos, v_col, v_uv, v_normal;   // Varyings received from the vertex shader: position, color, texture coordinates, normal (if any)
      uniform vec3 light;                     // Uniform: light direction, smooth normals enabled
      uniform vec4 o;                         // options [smooth, shading enabled, ambient, mix]
      uniform sampler2D sampler;              // Uniform: 2D texture
      out vec4 c;                             // Output: final fragment color

      // The code below displays colored / textured / shaded fragments
      void main() {
        c = mix(texture(sampler, v_uv.xy), v_col, o[3]);  // base color (mix of texture and rgba)
        if(o[1] > 0.){                                    // if lighting/shading is enabled:
          c = vec4(                                       // output = vec4(base color RGB * (directional shading + ambient light)), base color Alpha
            c.rgb * (max(0., dot(light, -normalize(       // Directional shading: compute dot product of light direction and normal (0 if negative)
              o[0] > 0.                                   // if smooth shading is enabled:
              ? vec3(v_normal.xyz)                        // use smooth normals passed as varying
              : cross(dFdx(v_pos.xyz), dFdy(v_pos.xyz))   // else, compute flat normal by making a cross-product with the current fragment and its x/y neighbours
            )))
            + o[2]),                                      // add ambient light passed as uniform
            c.a                                           // use base color's alpha
          );
        }
      }`
      );
      
      // Compile the Fragment shader and attach it to the program
      W.gl.compileShader(t$1);
      W.gl.attachShader(W.program, t$1);
      console.log('fragment shader:', W.gl.getShaderInfoLog(t$1) || 'OK');
      
      // Compile the program
      W.gl.linkProgram(W.program);
      W.gl.useProgram(W.program);
      console.log('program:', W.gl.getProgramInfoLog(W.program) || 'OK');
      
      // Set the scene's background color (RGBA)
      W.gl.clearColor(1, 1, 1, 1);
      
      // Shortcut to set the clear color
      W.clearColor = c => W.gl.clearColor(...W.col(c));
      W.clearColor("fff");
      
      // Enable fragments depth sorting
      // (the fragments of close objects will automatically overlap the fragments of further objects)
      W.gl.enable(2929 /* DEPTH_TEST */);
      
      // When everything is loaded: set default light / camera
      W.light({y: -1});
      W.camera({fov: 30});
      
      // Draw the scene. Ignore the first frame because the default camera will probably be overwritten by the program
      setTimeout(W.draw, 16);
    },

    // Set a state to an object
    setState: (state, type, texture) => {

      // Custom name or default name ('o' + auto-increment)
      state.n ||= 'o' + W.objs++;
      
      // Size sets w, h and d at once (optional)
      if(state.size) state.w = state.h = state.d = state.size;
      
      // If a new texture is provided, build it and save it in W.textures
      if(state.t && state.t.width && !W.textures[state.t.id]){
        texture = W.gl.createTexture();
        W.gl.pixelStorei(37441 /* UNPACK_PREMULTIPLY_ALPHA_WEBGL */, true);
        W.gl.bindTexture(3553 /* TEXTURE_2D */, texture);
        W.gl.pixelStorei(37440 /* UNPACK_FLIP_Y_WEBGL */, 1);
        W.gl.texImage2D(3553 /* TEXTURE_2D */, 0, 6408 /* RGBA */, 6408 /* RGBA */, 5121 /* UNSIGNED_BYTE */, state.t);
        W.gl.generateMipmap(3553 /* TEXTURE_2D */);
        W.textures[state.t.id] = texture;
      }
      
      // Recompute the projection matrix if fov is set (near: 1, far: 1000, ratio: canvas ratio)
      if(state.fov){
        W.projection =     
          new DOMMatrix([
            (1 / Math.tan(state.fov * Math.PI / 180)) / (W.canvas.width / W.canvas.height), 0, 0, 0, 
            0, (1 / Math.tan(state.fov * Math.PI / 180)), 0, 0, 
            0, 0, -1001 / 999, -1,
            0, 0, -2002 / 999, 0
          ]);
      }
      
      // Save object's type,
      // merge previous state (or default state) with the new state passed in parameter,
      // and reset f (the animation timer)
      state = {type, ...(W.current[state.n] = W.next[state.n] || {w:1, h:1, d:1, x:0, y:0, z:0, rx:0, ry:0, rz:0, b:'888', mode:4, mix: 0}), ...state, f:0};
      
      // Build the model's vertices buffer if it doesn't exist yet
      if(W.models[state.type]?.vertices && !W.models?.[state.type].verticesBuffer){
        W.gl.bindBuffer(34962 /* ARRAY_BUFFER */, W.models[state.type].verticesBuffer = W.gl.createBuffer());
        W.gl.bufferData(34962 /* ARRAY_BUFFER */, new Float32Array(W.models[state.type].vertices), 35044 /*STATIC_DRAW*/);

        // Compute smooth normals if they don't exist yet (optional)
        if(!W.models[state.type].normals && W.smooth) W.smooth(state);
        
        // Make a buffer from the smooth/custom normals (if any)
        if(W.models[state.type].normals){
          W.gl.bindBuffer(34962 /* ARRAY_BUFFER */, W.models[state.type].normalsBuffer = W.gl.createBuffer());
          W.gl.bufferData(34962 /* ARRAY_BUFFER */, new Float32Array(W.models[state.type].normals.flat()), 35044 /*STATIC_DRAW*/); 
        }      
      }
      
      // Build the model's uv buffer (if any) if it doesn't exist yet
      if(W.models[state.type]?.uv && !W.models[state.type].uvBuffer){
        W.gl.bindBuffer(34962 /* ARRAY_BUFFER */, W.models[state.type].uvBuffer = W.gl.createBuffer());
        W.gl.bufferData(34962 /* ARRAY_BUFFER */, new Float32Array(W.models[state.type].uv), 35044 /*STATIC_DRAW*/); 
      }
      
      // Build the model's index buffer (if any) and smooth normals if they don't exist yet
      if(W.models[state.type]?.indices && !W.models[state.type].indicesBuffer){
        W.gl.bindBuffer(34963 /* ELEMENT_ARRAY_BUFFER */, W.models[state.type].indicesBuffer = W.gl.createBuffer());
        W.gl.bufferData(34963 /* ELEMENT_ARRAY_BUFFER */, new Uint16Array(W.models[state.type].indices), 35044 /* STATIC_DRAW */);
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
      W.next[state.n] = state;
    },
    
    // Draw the scene
    draw: (now, dt, v, i, transparent = []) => {
      
      // Loop and measure time delta between frames
      dt = now - W.lastFrame;
      W.lastFrame = now;
      requestAnimationFrame(W.draw);
      
      if(W.next.camera.g){
        W.render(W.next[W.next.camera.g], dt, 1);
      }
      
      // Create a matrix called v containing the current camera transformation
      v = W.animation('camera');
      
      // If the camera is in a group
      if(W.next?.camera?.g){

        // premultiply the camera matrix by the group's model matrix.
        v.preMultiplySelf(W.next[W.next.camera.g].M || W.next[W.next.camera.g].m);
      }
      
      // Send it to the shaders as the Eye matrix
      W.gl.uniformMatrix4fv(
        W.gl.getUniformLocation(W.program, 'eye'),
        false,
        v.toFloat32Array()
      );
      
      // Invert it to obtain the View matrix
      v.invertSelf();

      // Premultiply it with the Perspective matrix to obtain a Projection-View matrix
      v.preMultiplySelf(W.projection);
      
      // send it to the shaders as the pv matrix
      W.gl.uniformMatrix4fv(
        W.gl.getUniformLocation(W.program, 'pv'),
        false,
        v.toFloat32Array()
      );

      // Clear canvas
      W.gl.clear(16640 /* W.gl.COLOR_BUFFER_BIT | W.gl.DEPTH_BUFFER_BIT */);
      
      // Render all the objects in the scene
      for(i in W.next){
        
        // Render the shapes with no texture and no transparency (RGB1 color)
        if(!W.next[i].t && W.col(W.next[i].b)[3] == 1){
          W.render(W.next[i], dt);
        }
        
        // Add the objects with transparency (RGBA or texture) in an array
        else {
          transparent.push(W.next[i]);
        }
      }
      
      // Order transparent objects from back to front
      transparent.sort((a, b) => {
        // Return a value > 0 if b is closer to the camera than a
        // Return a value < 0 if a is closer to the camera than b
        return W.dist(b) - W.dist(a);
      });

      // Enable alpha blending
      W.gl.enable(3042 /* BLEND */);

      // Render all transparent objects
      for(i of transparent){

        // Disable depth buffer write if it's a plane or a billboard to allow transparent objects to intersect planes more easily
        if(["plane","billboard"].includes(i.type)) W.gl.depthMask(0);
      
        W.render(i, dt);
        
        W.gl.depthMask(1);
      }
      
      // Disable alpha blending for the next frame
      W.gl.disable(3042 /* BLEND */);
      
      // Transition the light's direction and send it to the shaders
      W.gl.uniform3f(
        W.gl.getUniformLocation(W.program, 'light'),
        W.lerp('light','x'), W.lerp('light','y'), W.lerp('light','z')
      );
    },
    
    // Render an object
    render: (object, dt, just_compute = ['camera','light','group'].includes(object.type), buffer) => {

      // If the object has a texture
      if(object.t) {

        // Set the texture's target (2D or cubemap)
        W.gl.bindTexture(3553 /* TEXTURE_2D */, W.textures[object.t.id]);

        // Pass texture 0 to the sampler
        W.gl.uniform1i(W.gl.getUniformLocation(W.program, 'sampler'), 0);
      }

      // If the object has an animation, increment its timer...
      if(object.f < object.a) object.f += dt;
      
      // ...but don't let it go over the animation duration.
      if(object.f > object.a) object.f = object.a;

      // Compose the model matrix from lerped transformations
      W.next[object.n].m = W.animation(object.n);

      // If the object is in a group:
      if(W.next[object.g]){

        // premultiply the model matrix by the group's model matrix.
        W.next[object.n].m.preMultiplySelf(W.next[object.g].M || W.next[object.g].m);
      }

      // send the model matrix to the vertex shader
      W.gl.uniformMatrix4fv(
        W.gl.getUniformLocation(W.program, 'm'),
        false,
        (W.next[object.n].M || W.next[object.n].m).toFloat32Array()
      );
      
      // send the inverse of the model matrix to the vertex shader
      W.gl.uniformMatrix4fv(
        W.gl.getUniformLocation(W.program, 'im'),
        false,
        (new DOMMatrix(W.next[object.n].M || W.next[object.n].m)).invertSelf().toFloat32Array()
      );
      
      // Don't render invisible items (camera, light, groups, camera's parent)
      if(!just_compute){
        
        // Set up the position buffer
        W.gl.bindBuffer(34962 /* ARRAY_BUFFER */, W.models[object.type].verticesBuffer);
        W.gl.vertexAttribPointer(buffer = W.gl.getAttribLocation(W.program, 'pos'), 3, 5126 /* FLOAT */, false, 0, 0);
        W.gl.enableVertexAttribArray(buffer);
        
        // Set up the texture coordinatess buffer (if any)
        if(W.models[object.type].uvBuffer){
          W.gl.bindBuffer(34962 /* ARRAY_BUFFER */, W.models[object.type].uvBuffer);
          W.gl.vertexAttribPointer(buffer = W.gl.getAttribLocation(W.program, 'uv'), 2, 5126 /* FLOAT */, false, 0, 0);
          W.gl.enableVertexAttribArray(buffer);
        }
        
        // Set the normals buffer
        if((object.s || W.models[object.type].customNormals) && W.models[object.type].normalsBuffer){
          W.gl.bindBuffer(34962 /* ARRAY_BUFFER */, W.models[object.type].normalsBuffer);
          W.gl.vertexAttribPointer(buffer = W.gl.getAttribLocation(W.program, 'normal'), 3, 5126 /* FLOAT */, false, 0, 0);
          W.gl.enableVertexAttribArray(buffer);
        }
        
        // Other options: [smooth, shading enabled, ambient light, texture/color mix]
        W.gl.uniform4f(

          W.gl.getUniformLocation(W.program, 'o'), 
          
          // Enable smooth shading if "s" is true
          object.s,
          
          // Enable shading if in TRIANGLE* mode and object.ns disabled
          ((object.mode > 3) || (W.gl[object.mode] > 3)) && !object.ns ? 1 : 0,
          
          // Ambient light
          W.ambientLight || 0.2,
          
          // Texture/color mix (if a texture is present. 0: fully textured, 1: fully colored)
          object.mix
        );
        
        // If the object is a billboard: send a specific uniform to the shaders:
        // [width, height, isBillboard = 1, 0]
        W.gl.uniform4f(
          W.gl.getUniformLocation(W.program, 'bb'),
          
          // Size
          object.w,
          object.h,               

          // is a billboard
          object.type == 'billboard',
          
          // Reserved
          0
        );
        
        // Set up the indices (if any)
        if(W.models[object.type].indicesBuffer){
          W.gl.bindBuffer(34963 /* ELEMENT_ARRAY_BUFFER */, W.models[object.type].indicesBuffer);
        }
          
        // Set the object's color
        W.gl.vertexAttrib4fv(
          W.gl.getAttribLocation(W.program, 'col'),
          W.col(object.b)
        );

        // Draw
        // Both indexed and unindexed models are supported.
        // You can keep the "drawElements" only if all your models are indexed.
        if(W.models[object.type].indicesBuffer){
          W.gl.drawElements(+object.mode || W.gl[object.mode], W.models[object.type].indices.length, 5123 /* UNSIGNED_SHORT */, 0);
        }
        else {
          W.gl.drawArrays(+object.mode || W.gl[object.mode], 0, W.models[object.type].vertices.length / 3);
        }
      }
    },
    
    // Helpers
    // -------
    
    // Interpolate a property between two values
    lerp: (item, property) => 
      W.next[item]?.a
      ? W.current[item][property] + (W.next[item][property] -  W.current[item][property]) * (W.next[item].f / W.next[item].a)
      : W.next[item][property],
    
    // Transition an item
    animation: (item, m = new DOMMatrix) =>
      W.next[item]
      ? m
        .translateSelf(W.lerp(item, 'x'), W.lerp(item, 'y'), W.lerp(item, 'z'))
        .rotateSelf(W.lerp(item, 'rx'),W.lerp(item, 'ry'),W.lerp(item, 'rz'))
        .scaleSelf(W.lerp(item, 'w'),W.lerp(item, 'h'),W.lerp(item, 'd'))
      : m,
      
    // Compute the distance squared between two objects (useful for sorting transparent items)
    dist: (a, b = W.next.camera) => a?.m && b?.m ? (b.m.m41 - a.m.m41)**2 + (b.m.m42 - a.m.m42)**2 + (b.m.m43 - a.m.m43)**2 : 0,
    
    // Set the ambient light level (0 to 1)
    ambient: a => W.ambientLight = a,
    
    // Convert an rgb/rgba hex string into a vec4
    col: c => [...c.replace("#","").match(c.length < 5 ? /./g : /../g).map(a => ('0x' + a) / (c.length < 5 ? 15 : 255)), 1], // rgb / rgba / rrggbb / rrggbbaa
    
    // Add a new 3D model
    add: (name, objects) => {
      W.models[name] = objects;
      if(objects.normals){
        W.models[name].customNormals = 1;
      }
      W[name] = settings => W.setState(settings, name);
    },
    
    // Built-in objects
    // ----------------
    
    group: t => W.setState(t, 'group'),
    
    move: (t, delay) => setTimeout(()=>{ W.setState(t); }, delay || 1),
    
    delete: (t, delay) => setTimeout(()=>{ delete W.next[t]; }, delay || 1),
    
    camera: (t, delay) => setTimeout(()=>{ W.setState(t, t.n = 'camera'); }, delay || 1),
      
    light: (t, delay) => delay ? setTimeout(()=>{ W.setState(t, t.n = 'light'); }, delay) : W.setState(t, t.n = 'light'),
  };

  // Smooth normals computation plug-in (optional)
  // =============================================

  W.smooth = (state, dict = {}, vertices = [], iterate, iterateSwitch, i, j, A, B, C, Ai, Bi, Ci, normal, AB, BC) => {
    
    // Prepare smooth normals array
    W.models[state.type].normals = [];
    
    // Fill vertices array: [[x,y,z],[x,y,z]...]
    for(i = 0; i < W.models[state.type].vertices.length; i+=3){
      vertices.push(W.models[state.type].vertices.slice(i, i+3));
    }
    
    // Iterator
    if(iterate = W.models[state.type].indices) iterateSwitch = 1;
    else iterate = vertices, iterateSwitch = 0;
      
    // Iterate twice on the vertices
    // - 1st pass: compute normals of each triangle and accumulate them for each vertex
    // - 2nd pass: save the final smooth normals values
    for(i = 0; i < iterate.length * 2; i+=3){
      j = i % iterate.length;
      A = vertices[Ai = iterateSwitch ? W.models[state.type].indices[j] : j];
      B = vertices[Bi = iterateSwitch ? W.models[state.type].indices[j+1] : j+1];
      C = vertices[Ci = iterateSwitch ? W.models[state.type].indices[j+2] : j+2];
      AB = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
      BC = [C[0] - B[0], C[1] - B[1], C[2] - B[2]];
      normal = i > j ? [0,0,0] : [AB[1] * BC[2] - AB[2] * BC[1], AB[2] * BC[0] - AB[0] * BC[2], AB[0] * BC[1] - AB[1] * BC[0]];
      dict[A[0]+"_"+A[1]+"_"+A[2]] ||= [0,0,0];
      dict[B[0]+"_"+B[1]+"_"+B[2]] ||= [0,0,0];
      dict[C[0]+"_"+C[1]+"_"+C[2]] ||= [0,0,0];
      W.models[state.type].normals[Ai] = dict[A[0]+"_"+A[1]+"_"+A[2]] = dict[A[0]+"_"+A[1]+"_"+A[2]].map((a,i) => a + normal[i]);
      W.models[state.type].normals[Bi] = dict[B[0]+"_"+B[1]+"_"+B[2]] = dict[B[0]+"_"+B[1]+"_"+B[2]].map((a,i) => a + normal[i]);
      W.models[state.type].normals[Ci] = dict[C[0]+"_"+C[1]+"_"+C[2]] = dict[C[0]+"_"+C[1]+"_"+C[2]].map((a,i) => a + normal[i]);
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

  W.add("plane", {
    vertices: [
      .5, .5, 0,    -.5, .5, 0,   -.5,-.5, 0,
      .5, .5, 0,    -.5,-.5, 0,    .5,-.5, 0
    ],
    
    uv: [
      1, 1,     0, 1,    0, 0,
      1, 1,     0, 0,    1, 0
    ],
  });
  W.add("billboard", W.models.plane);

  // Cube
  //
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |  x  | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  W.add("cube", {
    vertices: [
      .5, .5, .5,  -.5, .5, .5,  -.5,-.5, .5, // front
      .5, .5, .5,  -.5,-.5, .5,   .5,-.5, .5,
      .5, .5,-.5,   .5, .5, .5,   .5,-.5, .5, // right
      .5, .5,-.5,   .5,-.5, .5,   .5,-.5,-.5,
      .5, .5,-.5,  -.5, .5,-.5,  -.5, .5, .5, // up
      .5, .5,-.5,  -.5, .5, .5,   .5, .5, .5,
     -.5, .5, .5,  -.5, .5,-.5,  -.5,-.5,-.5, // left
     -.5, .5, .5,  -.5,-.5,-.5,  -.5,-.5, .5,
     -.5, .5,-.5,   .5, .5,-.5,   .5,-.5,-.5, // back
     -.5, .5,-.5,   .5,-.5,-.5,  -.5,-.5,-.5,
      .5,-.5, .5,  -.5,-.5, .5,  -.5,-.5,-.5, // down
      .5,-.5, .5,  -.5,-.5,-.5,   .5,-.5,-.5
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
  W.cube = settings => W.setState(settings, 'cube');

  // Pyramid
  //
  //      ^
  //     /\\
  //    // \ \
  //   /+-x-\-+
  //  //     \/
  //  +------+

  W.add("pyramid", {
    vertices: [
      -.5,-.5, .5,   .5,-.5, .5,    0, .5,  0,  // Front
       .5,-.5, .5,   .5,-.5,-.5,    0, .5,  0,  // Right
       .5,-.5,-.5,  -.5,-.5,-.5,    0, .5,  0,  // Back
      -.5,-.5,-.5,  -.5,-.5, .5,    0, .5,  0,  // Left
       .5,-.5, .5,  -.5,-.5, .5,  -.5,-.5,-.5, // down
       .5,-.5, .5,  -.5,-.5,-.5,   .5,-.5,-.5
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

  // Sphere
  //
  //          =   =
  //       =         =
  //      =           =
  //     =      x      =
  //      =           =
  //       =         =
  //          =   =

  ((i, ai, j, aj, p1, p2, vertices = [], indices = [], uv = [], precision = 20) => {
    for(j = 0; j <= precision; j++){
      aj = j * Math.PI / precision;
      for(i = 0; i <= precision; i++){
        ai = i * 2 * Math.PI / precision;
        vertices.push(+(Math.sin(ai) * Math.sin(aj)/2).toFixed(6), +(Math.cos(aj)/2).toFixed(6), +(Math.cos(ai) * Math.sin(aj)/2).toFixed(6));
        uv.push((Math.sin((i/precision))) * 3.5, -Math.sin(j/precision));
        if(i < precision && j < precision){
          indices.push(p1 = j * (precision + 1) + i, p2 = p1 + (precision + 1), (p1 + 1), (p1 + 1), p2, (p2 + 1));
        }
      }
    }
    W.add("sphere", {vertices, uv, indices});
  })();

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
  		onkeydown = (e) => {
  			this.down[e.key] = true;
  			if (!e.repeat && o.keys && o.keys[e.key]) {
  				o.keys[e.key]();
  				e.preventDefault();
  			}
  		};
  		onkeyup = (e) => {
  			this.down[e.key] = false;
  		};
  		onwheel = (e) => {
  			this.wheel += e.deltaY;
  		};
  		const handleClick = (e) => {
  			const { clientX, clientY, button } = e;
  			this.click = { clientX, clientY, button, left: button === 0, right: button === 2,
  				locked: isLocked(),
  			};
  		};
  		onclick = handleClick;
  		oncontextmenu = handleClick;
  	},
  };

  // Based off LittleJS's Vector2:
  // https://github.com/KilledByAPixel/LittleJS/blob/main/build/littlejs.esm.js#L693
  const vec3 = (x,y,z) => new Vector3(x,y,z);
  const sin = Math.sin, cos = Math.cos;

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
  		return ((this.x ** 2) + (this.y ** 2) + (this.x ** 2)) ** .5;
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

  	rotate(angleX, angleY, angleZ) {
  		return this.rotateX(angleX).rotateY(angleY).rotateZ(angleZ);
  	}

  	rotateX(angle = 0) {
  		return vec3(
  			this.x,
  			this.y * cos(angle) - this.z * sin(angle),
  			this.y * sin(angle) + this.z * cos(angle),
  		);
  	}

  	rotateY(angle = 0) {
  		return vec3(
  			this.x * cos(angle) + this.z * sin(angle),
  			this.y,
  			-this.x * sin(angle) + this.z * cos(angle),
  		);
  	}

  	rotateZ(angle = 0) {
  		return vec3(
  			this.x * cos(angle) - this.y * sin(angle),
  			this.x * sin(angle) + this.y * cos(angle),
  			this.z,
  		);
  	}
  }

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

  // const { W } = window;

  // Note that max distance is 1000
  // So world can be -500 --> 500 in any dimensions
  // Solar system is 30 trillion km diameter
  // so if the scale matches, then each 1.0 unit = 30 billion km
  const MAX_VEL = 1000;
  const SPACE_SIZE = 499;
  const skyboxDist = SPACE_SIZE;
  const PI = Math.PI;
  const TWO_PI = PI * 2;
  const VEL_FRICTION = 1 / 10000;
  const SHIP_THRUST = 0.01;

  const doc = document;

  const shipSize = 0.3;
  const sun = { rx: 0, ry: 0, ry: 0 };
  const ship = {
  	x: 0, y: 0, z: SPACE_SIZE,
  	rx: -90, ry: 0, rz: 0,
  	vel: { x: 0, y: 0, z: -16 },
  	thrust: { x: 0, y: 0, z: 0 },
  	fireCooldown: 0,
  	r: 2, // collision radius
  	passType: 'ship',
  	passthru: ['plasma'],
  };
  const t = 1000 / 60;
  const camOffset = { back: -shipSize * 5, up: shipSize * 1.7, rx: 80, ry: 0, rz: 0 };
  const steer = { rx: -90, ry: 0, rz: 0 };
  const physicsEnts = [ship];
  const renderables = {};
  const seed = 1233;
  const gen = new RandomGenerator(seed);

  // + https://lospec.com/palette-list/moondrom
  const BG_COLOR = '2a242b';
  const SHIP_COLOR = '5796a1';
  const SHIP_COLOR2 = '8bc7bf';
  const RING_COLOR = '5796a1';
  const RING_COLOR2 = '478691';
  const P1_COLOR = '471b6e';
  const P2_COLOR = 'b0455a';
  const SUN_COLOR = '#de8b6f'; // 'ff6633'
  const STAR_COLOR = '#ebd694';
  const SPACE_COLOR = '0000';
  const PLASMA_COLOR1 = '#702782';
  const PLASMA_COLOR2 = '#90d59c';
  // https://lospec.com/palette-list/arjibi8
  // 8bc7bf - light cyan
  // 5796a1 - dark cyan
  // 524bb3 - blue
  // 471b6e - darkest (purple)
  // 702782 - purple light
  // b0455a - red
  // de8b6f - orange
  // ebd694 - yellow
  // https://lospec.com/palette-list/moondrom
  // 2a242b - dark gray
  // 90d59c - green
  const textures = {};
  const achievements = [
  	'Check steering: [Tab] to toggle mouse-lock',
  	'Thrusters: [W]',
  	'Fire weapons: [Space] or [Click]',
  ].map((t) => ({ t, done: 0 }));

  function rad2deg(rad) { return rad * (180/PI); }
  function deg2rad(deg) { return deg * (PI/180); }
  function uid() { return String(Number(new Date())); }
  // Some functions here from LittleJS utilities
  function clamp(value, min=0, max=1) { return value < min ? min : value > max ? max : value; }
  function lerp(percent, valueA, valueB) { return valueA + clamp(percent) * (valueB-valueA); }
  function rand(valueA=1, valueB=0) { return valueB + Math.random() * (valueA-valueB); }

  function rotateByDegree(v, o) {
  	return v.rotate(deg2rad(o.rx), deg2rad(o.ry), deg2rad(o.rz));
  }
  function getDirectionUnit(o) {
  	return rotateByDegree(vec3(0, 1, 0), o);
  }
  function addAngles(a, b) {
  	let { rx, ry, rz } = a;
  	rx += b.rx;
  	ry += b.ry;
  	rz += b.rz;
  	return { rx, ry, rz };
  }

  function loop(n, fn) {
  	for (let i = 0; i < n; i += 1) { fn(i, n); }
  }
  const $id = (id) => doc.getElementById(id);

  function achieve(i) {
  	if (achievements[i].done) return;
  	achievements[i].done = 1;
  	updateAchievements();
  }

  function updateAchievements() {
  	$id('goals').innerHTML = achievements.map(
  		({ t, done }) => `<li class="${ done ? 'done' : ''}">${t}</li>`,
  	).join('');
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

  function addRect(name = 'cube', { x = .5, y = .5, z = .5 } = {}) {
  	W.add(name, {
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

  function getXYCoordinatesFromPolar(angle, r) {
  	const x = r * Math.cos(angle);
  	const y = r * Math.sin(angle);
  	return { x, y };
  }

  function makeCanvas(id, size) {
  	const existingElt = $id(id);
  	const elt = existingElt || doc.createElement('canvas');
  	elt.id = id;
  	elt.width = elt.height = size;
  	if (!existingElt) $id('loaded').appendChild(elt);
  	return [elt, elt.getContext('2d'), size / 2];
  }

  function makeStarFieldCanvas(id) {
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
  	c.beginPath();
  	const a = TWO_PI / points;
  	const line = (a, r) => {
  		const { x, y } = getXYCoordinatesFromPolar(a, r);
  		c.lineTo(h + x, h + y);
  	};
  	loop(points, (i) => {
  		line(a * i, h);
  		line(a * i + (a / 2), h * depth);
  	});
  	c.fillStyle = color;
  	c.fill();
  	return cElt;
  }

  function setup() {
  	const c = $id('canvas');
  	input.setup({
  		lockElt: c,
  		keys: {
  			Tab: () => { achieve(0); input.toggleLock(); },
  			// w: shipThrust(1)
  		}
  	});
  	textures.tf = makeStarCanvas(9, STAR_COLOR, 'tf', .3);
  	textures.plasma = makeStarCanvas(11, PLASMA_COLOR2, 'plasma', .2);
  	textures.photon = makeStarCanvas(13, PLASMA_COLOR1, 'photon', .5);
  	 

  	c.addEventListener('click', () => {
  		input.lock();
  	});
  	W.reset(c);
  	W.clearColor(BG_COLOR);
  	// W.camera({ z: 5000 });
  	W.light({ x: -1, y: -1.2, z: 0 }); // Set light direction: vector direction x, y, z
  	W.ambient(0.8); // Set ambient light's force (between 0 and 1)
  	// New shapes
  	addRect('ringWall', { y: 10, z: 5 });
  	// addRect('rect', { y: 1 });
  	// Groups and objects
  	W.group({ n: 'system' });
  	['sun', 'ring', 'p1', 'p2'].forEach((n) => W.group({ n, g: 'system' }));
  	['ship', 'skybox'].forEach((n) => W.group({ n })); // Are not in a group

  	const sunFlare = makeStarCanvas(16, `${SUN_COLOR}88`, 'sun', .7);

  	W.sphere({ n: 'outerSun', g: 'sun', size: 50, b: `${SUN_COLOR}88` });
  	W.sphere({ n: 'innerSun', g: 'sun', size: 46, b: SUN_COLOR });
  	W.billboard({ n: 'sunFlare', g: 'sun', size: 60, b: SUN_COLOR, t: sunFlare });
  	W.sphere({ n: 'planet1', g: 'p1', ...getXYCoordinatesFromPolar(0.5, 300), size: 20, b: P1_COLOR });
  	W.sphere({ n: 'planet2', g: 'p2', ...getXYCoordinatesFromPolar(0.7, 400), size: 8, b: P2_COLOR });

  	{
  		const b = SPACE_COLOR;
  		const size = skyboxDist * 2;
  		const t = makeStarFieldCanvas('sf');
  		[
  			{ z: -skyboxDist, b, t },
  			{ y: -skyboxDist, rx: -90, b, t },
  			{ y: skyboxDist, rx: 90, b, t },
  			{ x: -skyboxDist, ry: 90, b, t },
  			{ x: skyboxDist, ry: -90, b, t },
  			{ z: skyboxDist, rx: 180, b, t },
  		].forEach((settings, i) => {
  			W.plane({ b: '000', ...settings, n: `skybox${i}`, g: 'skybox', size });
  		});
  	}
  	// W.billboard({ n: 'flare', x: 0, y: 0, z: 0, size: 96, b: '#ff6633' });
  	addRect('engine', { x: 0.2, y: 0.2 });
  	{
  		const b = SHIP_COLOR;
  		const g = 'ship';
  		W.pyramid({ n: 'shipBase', g, size: shipSize, b });
  		W.cube({ n: 'shipCube', g, y: shipSize * -.5, size: shipSize * .8, b });
  		// W.cube({ n: 'shipCube2', g, y: shipSize * -.5, size: shipSize * .8, b, mode: 2 });
  		const eng = { n: 'shipEngine1', g, ry: 45, rx: 90, x: -shipSize * .6, y: shipSize * -.7, size: shipSize, b: SHIP_COLOR2 };
  		W.engine(eng);
  		W.engine({ ...eng, n: 'shipEngine2', x: -eng.x });
  		W.cube({ n: 'shipEngineBack1', g,  x: -shipSize * .6, y: shipSize * -1.15, size: shipSize / 4, b });
  		W.cube({ n: 'shipEngineBack2', g,  x: shipSize * .6, y: shipSize * -1.15, size: shipSize / 4, b });
  	}
  	// W.sphere({ n: 'forcefield', g, size: shipSize * 3, b: '77f0' });

  	const r = 200;
  	const TWO_PI = Math.PI * 2;
  	loop(32, (i, n) => {
  		const angle = i === 0 ? 0 : (TWO_PI * i) / n;
  		const deg = rad2deg(angle);
  		// console.log(i, angle, x, y);
  		let { x, y } = getXYCoordinatesFromPolar(angle, r);
  		const g = `r${i}`;
  		W.group({ n: g, g: 'ring' });
  		W.ringWall({
  			n: `ring${i}`,
  			g,
  			x,
  			y,
  			rz: deg,
  			size: 2,
  			b: RING_COLOR,
  		});
  		// y += 10;
  		W.cube({
  			n: `ringBuilding${i}`,
  			g,
  			x,
  			y,
  			rz: deg,
  			size: 5,
  			b: RING_COLOR2,
  		});
  	});
  	// Create litter / stardust
  	const randCoord = () => gen.rand(-SPACE_SIZE, SPACE_SIZE);
  	const randCoords = () => ({
  		x: randCoord(),
  		y: randCoord(),
  		z: randCoord(),
  	});
  	loop(200, (i) => {
  		W.billboard({
  			n: `litter${i}`,
  			g: 'system',
  			...randCoords(),
  			size: 1,
  			b: '555',
  		});
  	});
  	// Create physical crates
  	loop(50, (i) => {
  		const crate = {
  			n: `crate${i}`,
  			passType: 'crate',
  			passthru: ['crate'],
  			g: 'system',
  			...randCoords(),
  			vel: { ...vec3() },
  			size: 3,
  			r: 2, // collision radius
  			b: 'de8b6f',
  			rx: rand(0, 359),
  			ry: rand(0, 359),
  			rz: rand(0, 359),
  			hp: 3,
  		};
  		physicsEnts.push(crate);
  		renderables[crate.n] = crate;
  		W.cube(crate);
  	});
  	updateAchievements();
  }

  function thrust(o, amount = 0) {
  	const { x, y, z } = getDirectionUnit(ship).scale(amount);
  	o.thrust = { x, y, z};
  }

  function physics(o, sec) {
  	['x', 'y', 'z'].forEach((a) => {
  		let force = (o.thrust) ? o.thrust[a] || 0 : 0;
  		// If no thrust then apply friction (unrealistic in space? let's blame it on lots of star dust)
  		if (force === 0 && o.friction !== 0) force = -o.vel[a] * VEL_FRICTION;
  		const acc = force / (o.mass || 1);
  		o.vel[a] = clamp(o.vel[a] + (acc / sec), -MAX_VEL, MAX_VEL);
  		if (o.vel[a] < 0.0001 && o.vel[a] > -0.0001) o.vel[a] = 0;
  		o[a] = clamp(o[a] + o.vel[a] * sec, -SPACE_SIZE, SPACE_SIZE);
  	});
  }

  function dmg(a, b) {
  	if (a.damage && b.hp) {
  		b.hp -= a.damage;
  		a.decay = 0;
  		if (b.hp <= 0) b.decay = 0;
  	}
  }
  function collide(e1, e2, dist) {
  	// console.log('collide!', e1.n, e2.n);
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
  		const tm = m1 + m2;
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

  function checkCollisions(ents) {
  	loop(ents.length, (i) => {
  		checkCollisionOne(ents[i], ents);
  	});
  }

  function pass(a, b) {
  	return (a.passthru && a.passthru.includes(b.passType));
  }

  function checkCollisionOne(e1, ents) {
  	if (e1.collided) return;
  	loop(ents.length, (w) => {
  		const e2 = ents[w];
  		if (pass(e1, e2) || pass(e2, e1) || e1 === e2)  return;
  		if (e2.collided) return;
  		const d = vec3(e1).distance(e2);
  		if (d <= (e1.r + e2.r)) collide(e1, e2, d);
  	});
  }

  function move(things = {}) {
  	Object.keys(things).forEach((key) => {
  		W.move({ n: key, ...things[key] }, 0);
  	});
  }

  function update() {
  	const sec = t / 1000;

  	// Handle inputs
  	let thrustAmount = input.down.w ? SHIP_THRUST : 0;
  	if (input.down.s) thrustAmount = SHIP_THRUST * -.5;
  	thrust(ship, thrustAmount);
  	if (thrustAmount === 0) {
  		W.delete('shipEngineIgnite1');
  		W.delete('shipEngineIgnite2');
  	} else {
  		achieve(1);
  		const base = { g: 'ship', y: shipSize * -1.31, rx: 90, size: .2, t: textures.tf };
  		W.plane({ ...base, n: 'shipEngineIgnite1', x: -shipSize * .6  });
  		W.plane({ ...base, n: 'shipEngineIgnite2', x: shipSize * .6 });
  	}
  	const click = input.getClick();
  	if (ship.fireCooldown === 0 && (
  		input.down[' '] || (click && click.locked)
  	)) {
  		achieve(2);
  		const { x, y, z } = ship;
  		const u = getDirectionUnit(ship);
  		const v = u.scale(click.left ? 40 : 15).add(ship.vel); // scale 26 works well with thrust scale 0.1
  		const plasma = {
  			n: 'plasma' + uid(),
  			g: 'system',
  			passType: 'plasma',
  			x, y, z,
  			vel: { ...v }, // TODO: add velocity in
  			thrust: { ...u.scale(click.left ? 0.0005 : 0.0001) },
  			friction: 0,
  			decay: 4,
  			damage: click.left ? 1 : 2,
  			r: 0.5,
  			passthru: ['ship', 'plasma'],
  			mass: 0.01,
  		};
  		physicsEnts.push(plasma);
  		renderables[plasma.n] = plasma;
  		W.billboard({ ...plasma, size: 1, t: click.left ? textures.plasma : textures.photon });
  		ship.fireCooldown = 0.3;
  	}

  	// collide(physicsEnts);
  	checkCollisions(physicsEnts);
  	// Do physics, and clear collided flag
  	physicsEnts.forEach((o) => {
  		o.collided = 0;
  		physics(o, sec);
  	});
  	
  	// console.log('z', Math.round(z / 100), '* 100');
  	// W.camera({ x: x + camOffset.x, y: y + camOffset.y, z: z + camOffset.z });
  	// W.move({ n: 'ship', x, y, z, a: t / 2 }, 0);
  	// W.move({ n: 'ship', x: 0, y: 0, z: 0, a: t / 2 }, 0);
  	
  	const lockMove = input.getLockMove();
  	// if (lockMove.x || lockMove.y) console.log(lockMove);
  	steer.ry -= lockMove.x / 10;
  	steer.rx -= lockMove.y / 10;
  	['rx', 'ry', 'rz'].forEach((k) => ship[k] = lerp(0.1, ship[k], steer[k]));
  	{
  		const unit = rotateByDegree(vec3(0, camOffset.back, camOffset.up), steer);
  		W.camera({ ...unit, ...addAngles(camOffset, steer), a: 1000 });
  	}
  	{
  		const { x, y, z, rx, ry, rz } = ship;
  		W.move({ n: 'ship', rx, ry, rz });
  	}
  	// cool down
  	ship.fireCooldown = Math.max(ship.fireCooldown - sec, 0);

  	// Decay
  	Object.keys(renderables).forEach((k) => {
  		const p = renderables[k];
  		if (typeof p.decay === 'number') {
  			p.decay -= sec;
  			if (p.decay <= 0) {
  				// console.log('decay', p.n);
  				W.delete(p.n);
  				delete renderables[k];
  				const i = physicsEnts.findIndex((e) => e.n === p.n);
  				physicsEnts.splice(i, 1);
  			}
  		}
  	});


  	// Animate the system
  	sun.rx += t / 90;
  	sun.ry += t / 100;
  	move({
  		...renderables,
  		system: { x: -ship.x, y: -ship.y, z: -ship.z, a: t },
  		innerSun: { rx: sun.rx, ry: sun.ry },
  		p1: { rz: sun.rx * 0.1 },
  		p2: { rz: sun.rx * 0.15 },
  		ring: { rz: sun.rx * 0.5 },
  	});
  }

  addEventListener('DOMContentLoaded', () => {
  	setup();
  	setInterval(update, t);
  });

  window.g = {
  	renderables,
  	ship,
  	input,
  	physicsEnts,
  };

})();
