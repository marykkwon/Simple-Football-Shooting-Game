import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export class Final_Project extends Scene {
    constructor() {

        super();
        this.shapes = {
            goal  : new defs.Square(),
            ball  : new defs.Subdivision_Sphere(4),
            ground: new defs.Square(),
            left  : new defs.Square(),
            right : new defs.Square(),
            sky   : new defs.Square(),
            goalkeeper: new defs.Square(),
            fail  : new defs.Square(),
            win   : new defs.Square(),
        };

        this.materials = {
            test: new Material(new defs.Textured_Phong(),
                {
                    ambient: 0.5, diffusivity: .6, color: hex_color("#5b811f"),
                    texture: new Texture("assets/1.png")
                }),
            ground: new Material(new defs.Textured_Phong(),
                {
                    ambient: 0.4, diffusivity: .6, color: hex_color("#5b811f"),
                    texture: new Texture("assets/grass.jpg")
                }),
            sky: new Material(new defs.Textured_Phong(),
                {
                    ambient: 0.6, diffusivity: 1, color: hex_color("#5b811f"),
                    texture: new Texture("assets/sky.jpg")
                }),
            ball: new Material(new defs.Textured_Phong(),
                {
                    ambient: 0.7, diffusivity: .6, color: hex_color("#0c0c0c"),
                    texture: new Texture("assets/ball.png")
                }),
            goal: new Material(new defs.Textured_Phong(),
                {
                    ambient: 0.7, diffusivity: .6, color: hex_color("#ffffff"),
                    texture: new Texture("assets/goal.webp")
                }),
            back: new Material(new defs.Textured_Phong(),
                {
                    ambient: 0.7, diffusivity: .6, color: hex_color("#ffffff"),

                }),
            goalkeeper:new Material(new defs.Textured_Phong(),
                {
                    ambient: 0.5, diffusivity: 1, color: hex_color("#5b811f"),
                    texture: new Texture("assets/goalkeeper.png")
                }),
            fail:new Material(new defs.Textured_Phong(),
                {
                    ambient: 0.5, diffusivity: 1, color: hex_color("#5b811f"),
                    texture: new Texture("assets/fail.png")
                }),
            win:new Material(new defs.Textured_Phong(),
                {
                    ambient: 0.5, diffusivity: 1, color: hex_color("#5b811f"),
                    texture: new Texture("assets/win.png")
                }),

        }
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.

        this.key_triggered_button("hit", [ "j" ], () => this.hit ^=1);

    }



    display(context, program_state) {
        // display():  Called once per frame of animation.
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, -50, -250));

        }
        const light_position = vec4(0, 0, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 100)];
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 500);

        const t = program_state.animation_time / 1000;
        let ground_transform=Mat4.identity()
            .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
            .times(Mat4.scale(150, 150, 1));
        let left_transform=Mat4.identity()
            .times(Mat4.translation(-100, 100, 0))
            .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
            .times(Mat4.scale(150, 100, 1));
        let right_transform=Mat4.identity()
            .times(Mat4.translation(100, 100, 0))
            .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
            .times(Mat4.scale(150, 100, 1));
        let top_transform=Mat4.identity()
            .times(Mat4.translation(0, 200, 0))
            .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
            .times(Mat4.scale(150, 150, 1));
        let ball_transform=Mat4.identity()
            .times(Mat4.translation(0, 10, 150))
            .times(Mat4.scale(5, 5, 5))
        let goal_transform=Mat4.identity()
            .times(Mat4.translation(0, 20, -150))
            .times(Mat4.scale(40, 40, 40));

        let goalkeeper_transform=Mat4.identity()
            .times(Mat4.translation(60*Math.sin(3.2*t),0,0,))
            .times(Mat4.translation(0, 20, -100))
            .times(Mat4.scale(20, 20, 20));
        let fail_transformation=Mat4.identity()
            .times(Mat4.translation(0, 100, -150))
            .times(Mat4.scale(30, 30, 30));
        let win_transformation=Mat4.identity()
            .times(Mat4.translation(0, 100, -150))
            .times(Mat4.scale(30, 30, 30));

        if(this.hit) {
            ball_transform = Mat4.translation(0, 0, -140 * t).times(ball_transform).times(Mat4.rotation(-3 * t, 1, 0, 0))
        }
        let goalkeeper_c = goalkeeper_transform.times(vec4(0, 0, 0, 1))
        let ball_c = ball_transform.times(vec4(0, 0, 0, 1))
        let goal_c = goal_transform.times(vec4(0, 0, 0, 1))
        let p1 = goalkeeper_c[0] - ball_c[0]
        let p2 = goalkeeper_c[1] - ball_c[1]
        let p3 = goalkeeper_c[2] - ball_c[2]
        let d = Math.sqrt(p1 * p1 + p2 * p2 + p3 * p3)

        if (d <= 25) {
            this.f = true;
        }
        if(this.f){
            ball_transform = Mat4.identity()
                .times(Mat4.translation(0, 10, -100))
                .times(Mat4.scale(5, 5, 5));
            goalkeeper_transform = Mat4.identity()
                .times(Mat4.translation(0, 20, -100))
                .times(Mat4.scale(20, 20, 20));
            this.shapes.fail.draw(context, program_state, fail_transformation, this.materials.fail)

        }
        if (ball_c[2] - goal_c[2] <= 5 && !this.f) {
            ball_transform = Mat4.identity()
                .times(Mat4.translation(0, 10, -150))
                .times(Mat4.scale(5, 5, 5));
            this.shapes.win.draw(context, program_state, win_transformation, this.materials.win)
        }



        this.shapes.ball.draw(context, program_state,ball_transform, this.materials.ball);
        this.shapes.goal.draw(context, program_state, goal_transform, this.materials.goal);
        this.shapes.ground.draw(context, program_state,ground_transform, this.materials.ground);
        this.shapes.goalkeeper.draw(context, program_state,goalkeeper_transform, this.materials.goalkeeper);
        this.shapes.left.draw(context, program_state,left_transform, this.materials.test);
        this.shapes.right.draw(context, program_state,right_transform, this.materials.test);
        this.shapes.sky.draw(context, program_state,top_transform, this.materials.sky);

    }

}