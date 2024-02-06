import { NodeTypes } from "./ast";

const enum TagType {
  Start,
  End,
}

export function baseParse(content:string) {

  const context = createParserContext(content);
  return createRoot(parseChildren(context));
  
}
function parseChildren (context) {
  const nodes : any= [];
  let node;
  const s = context.source;
  if(s.startsWith("{{")){
    node = parseInterpolation(context);
  } else if(s[0] ==="<") {
    if(/[a-z]/i.test(s[1])){
      console.log("parse element")
      node =  parseElement(context);
    }
  }
  nodes.push(node);
  return nodes


}
function parseElement(context: any) {

  //1.解析tag
  const element =  parseTag(context,TagType.Start);
  parseTag(context,TagType.End);
  console.log("-------",context.source)
  return element
}
function parseTag(context: any, type:TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  console.log("match", match);
  const tag = match[1];
  //2.刪除解析後的context 簡單的來說處理<div></div>
  // 處理<div
  advanceBy(context, match[0].length);
  // 處理>
  advanceBy(context, 1);
  // 處理</div>
  if(type === TagType.End) return;
  console.log("context", context.source);
  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
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


