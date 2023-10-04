import React, {memo} from 'react';
import RenderHtml, {useInternalRenderer} from 'react-native-render-html';
import MathJax from 'react-native-mathjax';
import {ScrollView, useWindowDimensions, View} from 'react-native';

const WebViewComponent = ({width, font, source, tagsStyles}) => {
  const windowDimension = useWindowDimensions();

  function CustomPreRenderer(props) {
    const {rendererProps} = useInternalRenderer('pre', props);

    let mathSrc = '';

    const getAllChildrenData = node => {
      if (!node) {
        return '';
      }

      if (node.type === 'tag') {
        if (!!node?.children && node?.children?.length > 0) {
          return `<${node.name}>${node.children
            .map(child => getAllChildrenData(child))
            .join('')}</${node.name}>`;
        } else {
          return `<${node.name}></${node.name}>`;
        }
      } else {
        return node.data || '';
      }
    };

    if (props?.tnode?.init?.domNode?.children?.length > 0) {
      mathSrc = props?.tnode?.init?.domNode?.children
        .map(child => getAllChildrenData(child))
        .join('');
    } else {
      mathSrc = props?.tnode?.init?.domNode?.children?.[0]?.data || '';
    }

    //  const runFirst = `document.head.insertAdjacentHTML("beforeend", \`${link}\`)`;

    const mmlOptions = {
      messageStyle: 'none',
      extensions: ['tex2jax.js'],
      styles: {
        '#formula': {
          'margin-left': '-8px',
          'font-weight': 500,
          'font-size': 15,
          color: '#000',
          'font-style': 'normal',
          height: 0,
          'margin-top': 0,
        },
      },
      'HTML-CSS': {scale: 80},
      jax: ['input/TeX', 'output/HTML-CSS'],
      tex2jax: {
        inlineMath: [
          ['$**^&', '$**^&'],
          ['\\(', '\\)'],
        ],
        displayMath: [
          ['$$', '$$'],
          ['\\[', '\\]'],
        ],
        processEscapes: true,
      },
      TeX: {
        extensions: [
          'AMSmath.js',
          'AMSsymbols.js',
          'noErrors.js',
          'noUndefined.js',
        ],
      },
    };
    const handleCheckIsOnlyLatex = string => {
      const preContent = string?.replace(/ /g, '');
      const dollarContents = preContent?.match(/\$\*\*\^&(.*?)\$\*\*\^&/gs);
      const concatenatedDollarContents = dollarContents
        ? dollarContents?.map(str => str.replace(/\$\*\*\^&/g, '')).join('')
        : '';
      const strippedPreContent = preContent?.replace(/\$\*\*\^&/g, '');
      return strippedPreContent === concatenatedDollarContents;
    };

    const isOnlyLatex = handleCheckIsOnlyLatex(mathSrc);

    return (
      <>
        <ScrollView
          scrollEnabled={isOnlyLatex}
          horizontal={isOnlyLatex ? true : undefined}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled={true}>
          <View
            key={Date.now()}
            style={{
              minWidth: isOnlyLatex ? 800 : '100%',
              backgroundColor: 'transparent',
            }}>
            <MathJax
              html={`<p>${mathSrc}</p>`}
              mathJaxOptions={mmlOptions}
              hasIframe={true}
              enableBaseUrl={true}
              style={{
                backgroundColor: 'transparent',
                marginTop: isOnlyLatex ? -3 : -4,
              }}
              //    injectedJavaScript={runFirst}
            />
          </View>
        </ScrollView>
      </>
    );
  }

  const defaultTagsStyles = {
    p: {
      color: '#000',
      fontWeight: '600',
      fontStyle: 'normal',
      fontSize: 15,
      textAlign: 'left',
    },
    pre: {
      color: '#000',
      fontWeight: '900',
      fontStyle: 'normal',
      fontSize: 15,
      textAlign: 'left',
    },
  };

  const renderers = {
    pre: CustomPreRenderer,
  };

  return (
    <RenderHtml
      contentWidth={width || windowDimension?.width}
      source={source}
      systemFonts={[font]}
      tagsStyles={tagsStyles || defaultTagsStyles}
      renderers={renderers}
    />
  );
};

export default memo(WebViewComponent);
