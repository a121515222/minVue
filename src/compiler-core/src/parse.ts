import { NodeTypes } from "./ast";


export function baseParse(content:string) {

  const context = createParserContext(content);
  return createRoot(parseChildren(context));
  
}
function parseChildren (context) {
  const nodes : any= [];
  let node;
  if(context.source.startsWith("{{")){
    node = parseInterpolation(context);
  }
  nodes.push(node);
  return nodes


}

function parseInterpolation(context){

  const openDelimiter = "{{";
  const closeDelimiter = "}}"
  // 以下步驟再進行{{message}}的推進
  //取得 closeIndex
  const closeIndex = context.source.indexOf(closeDelimiter,openDelimiter.length);
  //把前面的{{移除
  advanceBy(context, openDelimiter.length);

  //取得message的長度
  const rawContentLength = closeIndex - openDelimiter.length;
  // 取得message
  const rawContent = context.source.slice(0,rawContentLength)
  const content = rawContent.trim();
  // 繼續推進 因為{{message}}後面可能有<div>,所以要移除}}
  advanceBy(context, rawContentLength + closeDelimiter.length);
  console.log("context.source", context.source)
  console.log("content", content)
  
  return {
    type:NodeTypes.INTERPOLATION ,
    content:{
      type:NodeTypes.SIMPLE_EXPRESSION,
      content:content
    }
  }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}

function createRoot (children) {
  return{
    children,
  }
}


function createParserContext(content:string):any{
  return{
    source:content
  }
}