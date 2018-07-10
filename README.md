# glue.js

Glue.js Javascript Lirary v0.2.0 (Beta)

glue.js是一個用來動態載入html區塊的javascript library，以ECMA Script 5語法開發，一般主流瀏覽器皆適用（IE11可）

我開發此js library最初的目的就是為了使用ES5的環境下，用成本最低的方式開發SPA (Single Page Application，單頁式應用程式) 網站，並且不需依賴框架程式。

## Step1 將glue.js置入網頁

和使用一般js元件方式相同，一般建議放至<body>區域底部，例如

    <script src="glue.js"  type="text/javascript"></script>

## Step2 定義載入頁面

首先把之後需動態載入的頁面定義名稱，以key-value的方式對應。

語法為：

glue.source( __設定__ )

詳細範例如下：

    glue.source({
    	"intro": {
    		html:  "intro.html",
    	},
    	"search": {
    		html:  "search.html",
    	},
    })

*目前glue.js僅提供html載入

## Step3 html放置位置

自定義html的tag名稱，例如

    <content></content>

## Step4 動態載入

延續前面範例，如要將intro.html放置到content區塊，範例如下：

    glue.load("content", "intro")
	    .success(function(){
		    // 載入完成要做的事情寫在這
		})
		.error(function(){
			// 載入失敗要做的事情寫在這
		})
		.done(function(){
			// 最後要做的事情寫在這
		})

要注意的事情是html是透過get方式載入，必須要注意非同步的問題，所以請參考上述之範例寫法。



		    
