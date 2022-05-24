/* craco.config.js */

/**
 * Use this to override antd default styles
 * A list of antd classes and value can be found here :
 * https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
 */
const CracoLessPlugin = require("craco-less");

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              "@primary-color": "#6f4cef",
              "@border-radius-base": "4px",
              "@btn-text-shadow": "0 -1px 0 rgba(0, 0, 0, 0)",
              "@btn-primary-shadow": "0 2px 0 rgba(0, 0, 0, 0)",
              "@btn-font-weight": "600",
              "@height-base": "35px",
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
