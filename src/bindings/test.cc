#define NODE_WANT_INTERNALS 1

#include <env.h>
#include <env-inl.h>
#include <nan.h>
#include <v8-profiler.h>

using namespace v8;

class ExternalCarrier {
public:
  boolean_t is_main_thread;
  uint64_t thread_id;
};

static void ExportedFn(const v8::FunctionCallbackInfo<v8::Value>& args) {
    ExternalCarrier* carrier = reinterpret_cast<ExternalCarrier*>(args.Data().As<External>()->Value());

    Local<Object> returned = Nan::New<Object>();

    Nan::Set(returned, Nan::New<String>("isMainThread").ToLocalChecked(), 
                       Nan::New<Boolean>(carrier->is_main_thread));
    Nan::Set(returned, Nan::New<String>("threadId").ToLocalChecked(), 
                    Nan::New<Number>(carrier->thread_id));

    args.GetReturnValue().Set(returned);
}

NODE_MODULE_INIT(/* exports, module, context */){
  node::Environment* env = (node::GetCurrentEnvironment(context));
  ExternalCarrier* carrier = new ExternalCarrier();

  carrier->thread_id = env->thread_id();
  carrier->is_main_thread = env->is_main_thread();

  Local<External> external = External::New(env->isolate(), carrier);

  exports->Set(context, 
               Nan::New<String>("exportedFn").ToLocalChecked(),
               FunctionTemplate::New(env->isolate(), ExportedFn, external)->GetFunction(context).ToLocalChecked()).FromJust();
};