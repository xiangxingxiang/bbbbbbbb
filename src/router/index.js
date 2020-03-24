import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
	{
		path:'/',
		name:'login',
		component:function(){
			return import("../views/login.vue")
		}
	},
	{
		path:'/index',
		name:'index',
		component:function(){
			return import("../views/index")
		},
		children:[{
			path:'/class',
			name:'class',
			component:function(){
				return import("../views/class/class.vue")
			}
		},{
			path:'/course',
			name:'Course',
			component:function(){
				return import("../views/course/Course")
			}
		},{
			path:'/courseoperate',
			name:'CourseOperate',
			component:function(){
				return import("../views/course/CourseOperate")
			}
		}]
	}
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
