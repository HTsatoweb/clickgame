
(function(){
  "use strict";
const FEATURES = [
    ['gpuNebula','GPU星雲背景','宇宙'],
    ['gpuStars','GPU星フィールド','宇宙'],
    ['gpuAurora','オーロラ帯','宇宙'],
    ['gpuGrid','ホログラム格子','量子'],
    ['gpuVignette','ビネット','描画'],
    ['scanlines','走査線','描画'],
    ['bloom','ブルーム光','描画'],
    ['chroma','色収差','描画'],
    ['parallax','視差カメラ','描画'],
    ['shockwave','衝撃波','粒子'],
    ['ripple','水面波紋','粒子'],
    ['rings','エネルギー輪','粒子'],
    ['sparks','火花','粒子'],
    ['fireflies','ホタル','粒子'],
    ['meteors','流星','宇宙'],
    ['lightning','稲妻','天候'],
    ['confetti','紙吹雪','粒子'],
    ['prism','プリズム破片','粒子'],
    ['orbit','周回粒子','量子'],
    ['vortex','渦','粒子'],
    ['helix','螺旋','量子'],
    ['constellation','星座線','星座'],
    ['trail','残光トレイル','粒子'],
    ['afterimage','残像','描画'],
    ['lensflare','レンズフレア','描画'],
    ['heatHaze','陽炎','天候'],
    ['pixelBurst','ピクセルバースト','粒子'],
    ['neonRain','ネオン雨','天候'],
    ['quantumFoam','量子泡','量子'],
    ['crystal','結晶','粒子'],
    ['pulseWave','パルス波','量子'],
    ['tessera','テッセラ','描画'],
    ['fractal','フラクタル閃光','描画'],
    ['cometTail','彗星尾','宇宙'],
    ['halo','コア光輪','クリック'],
    ['sparkleText','キラキラ数値','UI'],
    ['comboAura','コンボオーラ','クリック'],
    ['critFlash','クリティカル閃光','クリック'],
    ['rankGlow','ランク発光','UI'],
    ['themeShift','色相シフト','色'],
    ['paletteCycle','パレット循環','色'],
    ['nightMode','夜空強調','色'],
    ['dawnMode','夜明け','色'],
    ['duskMode','夕焼け','色'],
    ['auroraMode','極光モード','色'],
    ['cyberMode','サイバー','色'],
    ['crystalMode','クリスタル','色'],
    ['voidMode','ヴォイド','色'],
    ['softParticles','柔らかい粒子','粒子'],
    ['hardParticles','硬い粒子','粒子'],
    ['additiveBlend','加算合成','描画'],
    ['workerSim','Worker物理','エンジン'],
    ['workerAudio','Worker音源','音'],
    ['workerStats','Worker統計','エンジン'],
    ['autoQuality','自動画質','エンジン'],
    ['batterySaver','省電力','エンジン'],
    ['mobileTune','スマホ最適化','エンジン'],
    ['hiDpr','高DPI制限','エンジン'],
    ['pauseHidden','非表示時停止','エンジン'],
    ['fpsCap','FPS上限','エンジン'],
    ['touchRipple','タッチ波','クリック'],
    ['multiTouch','マルチタッチ火花','クリック'],
    ['longPressPulse','長押し脈動','クリック'],
    ['comboPitch','コンボ音程','音'],
    ['critChime','クリットチャイム','音'],
    ['subKick','低音キック','音'],
    ['shimmer','キラ音','音'],
    ['echoClick','エコー','音'],
    ['stereoPan','ステレオ定位','音'],
    ['softLimiter','音量リミッタ','音'],
    ['uiBlip','UIクリック音','音'],
    ['missionFanfare','ミッションファンファーレ','音'],
    ['weatherTint','天候色','天候'],
    ['fogLayer','フォグ','天候'],
    ['dustMotes','塵','粒子'],
    ['ember','残り火','粒子'],
    ['snow','雪結晶','天候'],
    ['sakura','花びら','天候'],
    ['bubble','泡','粒子'],
    ['gearSpin','歯車回転','UI'],
    ['runes','ルーン文字','UI'],
    ['barcode','走査バー','UI'],
    ['glitch','グリッチ','描画'],
    ['datastream','データストリーム','UI'],
    ['radar','レーダー円','UI'],
    ['compass','方位リング','星座'],
    ['clockPulse','秒針パルス','UI'],
    ['energyMeter','エネルギー脈','UI'],
    ['cpsSpark','CPS火花','クリック'],
    ['prestigeGlow','転生予兆','UI'],
    ['shopPulse','購入パルス','UI'],
    ['tabShine','タブ光沢','UI'],
    ['logSpark','ログ火花','UI'],
    ['hudNeon','HUDネオン','UI'],
    ['dockPulse','ドック脈動','UI'],
    ['toastPop','トースト','UI'],
    ['screenShake','微振動','クリック'],
    ['safeShake','弱い振動','クリック'],
    ['haptics','触覚','クリック'],
    ['comboBannerFX','コンボ帯','クリック'],
    ['missionSpark','ミッション閃光','UI'],
    ['starBurst','星バースト','星座'],
    ['rainbowArc','虹弧','色'],
    ['twinCore','双子コア残像','クリック'],
    ['echoRing','残響輪','粒子'],
    ['plasma','プラズマ','量子'],
    ['ionTrail','イオン軌跡','量子'],
    ['magnet','磁力線','量子'],
    ['gravityWell','重力井戸','宇宙'],
    ['timeRipple','時間波','量子'],
    ['spaceFold','空間折り','宇宙'],
    ['nova','ノヴァ','宇宙'],
    ['supernova','超新星','宇宙'],
    ['blackhole','ブラックホール輪','宇宙'],
    ['wormhole','ワームホール','宇宙'],
    ['satellite','衛星','宇宙'],
    ['asteroid','小惑星','宇宙'],
    ['nebulaPulse','星雲脈動','宇宙'],
    ['cosmicDust','宇宙塵','宇宙'],
    ['photon','光子','量子'],
    ['electron','電子軌道','量子'],
    ['quark','クォーク点','量子'],
    ['waveFunc','波動関数','量子'],
    ['lattice','結晶格子','量子'],
    ['circuit','回路線','UI'],
    ['nodePulse','ノード脈','UI'],
    ['comboFire','コンボ炎','クリック'],
    ['iceShard','氷片','天候'],
    ['windSlash','風斬','天候'],
    ['earthCrack','地割れ光','天候'],
    ['waterDrop','水滴','天候'],
    ['leafSpin','葉回転','天候'],
    ['x0','オリオンのベルト','星座'],
    ['x1','オリオンの盾','星座'],
    ['x2','北斗七星','星座'],
    ['x3','ひしゃくの柄','星座'],
    ['x4','カシオペヤW','星座'],
    ['x5','はくちょうの翼','星座'],
    ['x6','こと座の琴','星座'],
    ['x7','さそりの鉤','星座'],
    ['x8','南十字の軸','星座'],
    ['x9','アンドロメダの鎖','星座'],
    ['x10','ペガススの四辺','星座'],
    ['x11','おおぐま座','星座'],
    ['x12','こぐま座','星座'],
    ['x13','北極星ロック','星座'],
    ['x14','いての弓','星座'],
    ['x15','ふたごの灯','星座'],
    ['x16','おうしの角','星座'],
    ['x17','ししのたてがみ','星座'],
    ['x18','おとめの穂','星座'],
    ['x19','みずがめの瓶','星座'],
    ['x20','うおの紐','星座'],
    ['x21','かにの殻','星座'],
    ['x22','やぎの角','星座'],
    ['x23','てんびんの皿','星座'],
    ['x24','おひつじの毛','星座'],
    ['x25','へびつかい','星座'],
    ['x26','りゅう座の環','星座'],
    ['x27','かんむり座','星座'],
    ['x28','ペルセウスの剣','星座'],
    ['x29','ケフェウスの家','星座'],
    ['x30','りゅうこつの竜骨','星座'],
    ['x31','ほ座の帆','星座'],
    ['x32','とも座の船尾','星座'],
    ['x33','ケンタウルス','星座'],
    ['x34','おおかみ座','星座'],
    ['x35','からす座','星座'],
    ['x36','コップ座','星座'],
    ['x37','うみへびの頭','星座'],
    ['x38','こじし座','星座'],
    ['x39','や座','星座'],
    ['x40','いるか座','星座'],
    ['x41','こうま座','星座'],
    ['x42','わし座の翼','星座'],
    ['x43','こと座ベガ','星座'],
    ['x44','デネブ航路','星座'],
    ['x45','アルタイル街道','星座'],
    ['x46','夏の大三角','星座'],
    ['x47','冬の大三角','星座'],
    ['x48','春の大曲線','星座'],
    ['x49','秋の四辺形','星座'],
    ['x50','シリウス閃光','星座'],
    ['x51','カノープス航','星座'],
    ['x52','リゲル灯台','星座'],
    ['x53','ベテルギウス脈','星座'],
    ['x54','アンタレス熱核','星座'],
    ['x55','スピカ結晶','星座'],
    ['x56','プロキオン双子','星座'],
    ['x57','カペラの山羊','星座'],
    ['x58','アルデバラン眼','星座'],
    ['x59','レグルスの心臓','星座'],
    ['x60','フォーマルハウト','星座'],
    ['x61','ポラリス固定','星座'],
    ['x62','ミルキーレーン','星座'],
    ['x63','銀河赤道','星座'],
    ['x64','黄道十二','星座'],
    ['x65','星座線アニメ','星座'],
    ['x66','星図回転','星座'],
    ['x67','星名ラベル','星座'],
    ['x68','等級の差','星座'],
    ['x69','変光星またたき','星座'],
    ['x70','連星の揺れ','星座'],
    ['x71','散開星団','星座'],
    ['x72','球状星団','星座'],
    ['x73','星雲印','星座'],
    ['x74','暗黒帯','星座'],
    ['x75','天の川の腰','星座'],
    ['x76','南天の十字航法','星座'],
    ['x77','北極星コンパス','星座'],
    ['x78','星座物語カード','星座'],
    ['x79','星座図鑑','星座'],
    ['x80','星座シール','星座'],
    ['x81','星座コンボ','星座'],
    ['x82','星座ミッション印','星座'],
    ['x83','星座テーマ空','星座'],
    ['x84','星図グリッド','星座'],
    ['x85','赤経目盛','星座'],
    ['x86','赤緯目盛','星座'],
    ['x87','子午環','星座'],
    ['x88','観測ドーム','星座'],
    ['x89','望遠鏡フレーム','星座'],
    ['x90','ファインダー円','星座'],
    ['x91','等級6まで','星座'],
    ['x92','等級3ハイライト','星座'],
    ['x93','重ね合わせ','量子'],
    ['x94','量子もつれ','量子'],
    ['x95','波動の崩壊','量子'],
    ['x96','トンネル効果','量子'],
    ['x97','不確定性霧','量子'],
    ['x98','プランク泡','量子'],
    ['x99','スピンアップ','量子'],
    ['x100','スピンダウン','量子'],
    ['x101','エネルギー準位','量子'],
    ['x102','光子交換','量子'],
    ['x103','ボソン場','量子'],
    ['x104','フェルミ海','量子'],
    ['x105','零点振動','量子'],
    ['x106','カシミール隙','量子'],
    ['x107','真空ゆらぎ','量子'],
    ['x108','干渉縞強化','量子'],
    ['x109','二重スリット','量子'],
    ['x110','確率雲','量子'],
    ['x111','軌道雲s','量子'],
    ['x112','軌道雲p','量子'],
    ['x113','軌道雲d','量子'],
    ['x114','量子数n','量子'],
    ['x115','量子数l','量子'],
    ['x116','量子数m','量子'],
    ['x117','パウリ排他','量子'],
    ['x118','量子井戸','量子'],
    ['x119','量子ドット','量子'],
    ['x120','量子細線','量子'],
    ['x121','ブロッホ球','量子'],
    ['x122','位相キック','量子'],
    ['x123','ハミルトニアン','量子'],
    ['x124','シュレーディンガー','量子'],
    ['x125','ディラック海','量子'],
    ['x126','プランク長輝点','量子'],
    ['x127','プランク時間点滅','量子'],
    ['x128','量子テレポート風','量子'],
    ['x129','エンタングル線','量子'],
    ['x130','ベル対','量子'],
    ['x131','測定フラッシュ','量子'],
    ['x132','観測者効果','量子'],
    ['x133','コヒーレンス','量子'],
    ['x134','デコヒーレンス','量子'],
    ['x135','ラビ振動','量子'],
    ['x136','ジョセフソン','量子'],
    ['x137','超伝導帯','量子'],
    ['x138','クーパー対','量子'],
    ['x139','量子ホール','量子'],
    ['x140','トポロジカル辺','量子'],
    ['x141','マヨラナ点','量子'],
    ['x142','エニオン軌道','量子'],
    ['x143','量子ウォーク','量子'],
    ['x144','量子サイコロ','量子'],
    ['x145','振幅の矢','量子'],
    ['x146','位相の色','量子'],
    ['x147','確率密度','量子'],
    ['x148','フラックス量子','量子'],
    ['x149','アハラノフボーム','量子'],
    ['x150','ベリー位相','量子'],
    ['x151','断熱定理','量子'],
    ['x152','ランダウ準位','量子'],
    ['x153','ツェナー効果','量子'],
    ['x154','シュタルク分裂','量子'],
    ['x155','ゼーマン色','量子'],
    ['x156','超微細構造','量子'],
    ['x157','ラムシフト','量子'],
    ['x158','コンプトン点','量子'],
    ['x159','光電パルス','量子'],
    ['x160','制動放射','量子'],
    ['x161','対生成閃光','量子'],
    ['x162','対消滅リング','量子'],
    ['x163','仮想粒子','量子'],
    ['x164','ループ線','量子'],
    ['x165','ファインマン風','量子'],
    ['x166','頂点結合','量子'],
    ['x167','ゲージ場','量子'],
    ['x168','対称性の破れ','量子'],
    ['x169','ヒッグス霞','量子'],
    ['x170','真空期待','量子'],
    ['x171','インスタントン','量子'],
    ['x172','インフレーション種','量子'],
    ['x173','量子宇宙論','量子'],
    ['x174','波動宇宙','量子'],
    ['x175','超新星残骸','宇宙'],
    ['x176','パルサー点滅','宇宙'],
    ['x177','クエーサー芯','宇宙'],
    ['x178','暗黒物質霞','宇宙'],
    ['x179','重力レンズ虹','宇宙'],
    ['x180','宇宙マイクロ波','宇宙'],
    ['x181','太陽風粒子','宇宙'],
    ['x182','磁気圏幕','宇宙'],
    ['x183','彗星のコマ','宇宙'],
    ['x184','流星群','宇宙'],
    ['x185','ペルセウス座流星','宇宙'],
    ['x186','しし座流星','宇宙'],
    ['x187','隕石の火球','宇宙'],
    ['x188','黄道光','宇宙'],
    ['x189','対日照','宇宙'],
    ['x190','地球光','宇宙'],
    ['x191','月の光輪','宇宙'],
    ['x192','食のダイヤモンド','宇宙'],
    ['x193','プロミネンス','宇宙'],
    ['x194','コロナ質量','宇宙'],
    ['x195','太陽黒点','宇宙'],
    ['x196','フレア閃光','宇宙'],
    ['x197','オーロラカーテン','宇宙'],
    ['x198','ヴァンアレン帯','宇宙'],
    ['x199','木星縞','宇宙'],
    ['x200','土星の環','宇宙'],
    ['x201','天王星の傾き','宇宙'],
    ['x202','海王星の風','宇宙'],
    ['x203','冥王星の心','宇宙'],
    ['x204','衛星イオの炎','宇宙'],
    ['x205','エウロパ氷','宇宙'],
    ['x206','タイタン霞','宇宙'],
    ['x207','エンケラドゥス噴','宇宙'],
    ['x208','ガニメデ磁','宇宙'],
    ['x209','カリスト傷','宇宙'],
    ['x210','フォボス転','宇宙'],
    ['x211','ダイモス砂','宇宙'],
    ['x212','系外惑星通過','宇宙'],
    ['x213','ホットジュピター','宇宙'],
    ['x214','スーパーアース','宇宙'],
    ['x215','ドリフト氷惑星','宇宙'],
    ['x216','潮汐ロック','宇宙'],
    ['x217','ラグランジュ点','宇宙'],
    ['x218','ヒル圏','宇宙'],
    ['x219','ロッシュ限界','宇宙'],
    ['x220','降着円盤','宇宙'],
    ['x221','ジェット噴流','宇宙'],
    ['x222','相対論的ビーム','宇宙'],
    ['x223','事象の地平線','宇宙'],
    ['x224','エルゴ球','宇宙'],
    ['x225','ペンローズ過程','宇宙'],
    ['x226','ホーキング霧','宇宙'],
    ['x227','情報パラドックス風','宇宙'],
    ['x228','ワームホール口','宇宙'],
    ['x229','宇宙ひも','宇宙'],
    ['x230','ドメインウォール','宇宙'],
    ['x231','磁気単極子','宇宙'],
    ['x232','バリオン非対称','宇宙'],
    ['x233','再電離の時代','宇宙'],
    ['x234','初代星の光','宇宙'],
    ['x235','銀河衝突','宇宙'],
    ['x236','潮汐尾','宇宙'],
    ['x237','スターバースト','宇宙'],
    ['x238','活動銀河核','宇宙'],
    ['x239','電波銀河ローブ','宇宙'],
    ['x240','重力波リング','宇宙'],
    ['x241','LISA風','宇宙'],
    ['x242','パルサータイミング','宇宙'],
    ['x243','標準光源','宇宙'],
    ['x244','距離梯子','宇宙'],
    ['x245','ハッブル流れ','宇宙'],
    ['x246','加速膨張','宇宙'],
    ['x247','ダークエネルギー霞','宇宙'],
    ['x248','宇宙の網','宇宙'],
    ['x249','フィラメント','宇宙'],
    ['x250','ボイド洞窟','宇宙'],
    ['x251','ローカルグループ','宇宙'],
    ['x252','アンドロメダ接近','宇宙'],
    ['x253','大マゼラン雲','宇宙'],
    ['x254','小マゼラン雲','宇宙'],
    ['x255','オリオン大星雲','宇宙'],
    ['x256','ラグーン風','宇宙'],
    ['x257','馬頭星雲影','宇宙'],
    ['x258','ヘリックス星雲','宇宙'],
    ['x259','光子雨','粒子'],
    ['x260','電子しぶき','粒子'],
    ['x261','陽子軌跡','粒子'],
    ['x262','中性子霧','粒子'],
    ['x263','ニュートリノ透','粒子'],
    ['x264','ミューオン線','粒子'],
    ['x265','タウ閃','粒子'],
    ['x266','グルーオン糸','粒子'],
    ['x267','クォーク3色','粒子'],
    ['x268','反粒子鏡','粒子'],
    ['x269','チェレンコフ青','粒子'],
    ['x270','霧箱の線','粒子'],
    ['x271','泡箱の跡','粒子'],
    ['x272','スパークチェンバー','粒子'],
    ['x273','飛跡検出','粒子'],
    ['x274','カロリメータ閃','粒子'],
    ['x275','シリコンヒット','粒子'],
    ['x276','ドリフトチェンバー','粒子'],
    ['x277','TOF点','粒子'],
    ['x278','ピクセルヒット','粒子'],
    ['x279','クラスタ光','粒子'],
    ['x280','ジェット円錐','粒子'],
    ['x281','欠損エネルギー','粒子'],
    ['x282','横運動量','粒子'],
    ['x283','衝突頂点','粒子'],
    ['x284','ビームハロー','粒子'],
    ['x285','バンチ交差','粒子'],
    ['x286','ルミノシティ','粒子'],
    ['x287','冷却ビーム','粒子'],
    ['x288','トラップイオン','粒子'],
    ['x289','光格子点','粒子'],
    ['x290','ボース凝縮霞','粒子'],
    ['x291','超流動渦','粒子'],
    ['x292','量子渦糸','粒子'],
    ['x293','音波量子','粒子'],
    ['x294','マグノン波','粒子'],
    ['x295','ポラリトン','粒子'],
    ['x296','プラズモン','粒子'],
    ['x297','フォノン波','粒子'],
    ['x298','エキシトン','粒子'],
    ['x299','ポーラロン','粒子'],
    ['x300','スキルミオン','粒子'],
    ['x301','ドメイン壁粒子','粒子'],
    ['x302','ナノ粒子金','粒子'],
    ['x303','量子ドット虹','粒子'],
    ['x304','コロイドゆらぎ','粒子'],
    ['x305','ブラウン運動','粒子'],
    ['x306','レヴィ飛行','粒子'],
    ['x307','ランダムウォーク','粒子'],
    ['x308','星のハープ','音'],
    ['x309','ベガの音色','音'],
    ['x310','シリウス鐘','音'],
    ['x311','パルサー拍','音'],
    ['x312','ブラックホール低音','音'],
    ['x313','量子クリック高音','音'],
    ['x314','干渉のうなり','音'],
    ['x315','準位の和音','音'],
    ['x316','光子の鈴','音'],
    ['x317','彗星の風音','音'],
    ['x318','オーロラコーラス','音'],
    ['x319','磁気圏ホイッスラー','音'],
    ['x320','流星ソニック','音'],
    ['x321','コア水晶音B','音'],
    ['x322','コア水晶音C','音'],
    ['x323','5度上のキラ','音'],
    ['x324','短調エコー','音'],
    ['x325','長調エコー','音'],
    ['x326','ペンタトニック星','音'],
    ['x327','全音階宇宙','音'],
    ['x328','和声スタック','音'],
    ['x329','ディレイ3連','音'],
    ['x330','リバーブ星空','音'],
    ['x331','ノイズゲート星','音'],
    ['x332','ビットクラッシュ星','音'],
    ['x333','FMキラ','音'],
    ['x334','AMゆらぎ','音'],
    ['x335','リングモジュ','音'],
    ['x336','ハーモナイザ','音'],
    ['x337','オクターバー','音'],
    ['x338','水素赤','色'],
    ['x339','酸素緑','色'],
    ['x340','窒素青','色'],
    ['x341','ヘリウム黄','色'],
    ['x342','ナトリウムD','色'],
    ['x343','カルシウムH','色'],
    ['x344','マグネシウムb','色'],
    ['x345','スペクトル虹','色'],
    ['x346','吸収線黒','色'],
    ['x347','輝線ネオン','色'],
    ['x348','ドップラー青','色'],
    ['x349','ドップラー赤','色'],
    ['x350','重力赤方偏移','色'],
    ['x351','温度黒体','色'],
    ['x352','3000K灯','色'],
    ['x353','6500K昼','色'],
    ['x354','12000K青白','色'],
    ['x355','O型星色','色'],
    ['x356','B型星色','色'],
    ['x357','A型星色','色'],
    ['x358','F型星色','色'],
    ['x359','G型星色','色'],
    ['x360','K型星色','色'],
    ['x361','M型星色','色'],
    ['x362','カーボン星','色'],
    ['x363','ウォルフ・ライエ','色'],
    ['x364','白色矮星青','色'],
    ['x365','宇宙嵐','天候'],
    ['x366','太陽嵐','天候'],
    ['x367','磁気嵐','天候'],
    ['x368','流星雨天気','天候'],
    ['x369','星霜','天候'],
    ['x370','星露','天候'],
    ['x371','真空の雪','天候'],
    ['x372','イオン霧','天候'],
    ['x373','プラズマ雷','天候'],
    ['x374','重力潮','天候'],
    ['x375','時間時化','天候'],
    ['x376','量子曇り','天候'],
    ['x377','干渉晴れ','天候'],
    ['x378','銀河曇','天候'],
    ['x379','暗黒晴','天候'],
    ['x380','極光天気','天候'],
    ['x381','黄道光時','天候'],
    ['x382','対日照時','天候'],
    ['x383','地球影','天候'],
    ['x384','星座クリット','クリック'],
    ['x385','量子クリット','クリック'],
    ['x386','銀河コンボ','クリック'],
    ['x387','準位コンボ','クリック'],
    ['x388','光子タップ','クリック'],
    ['x389','軌道タップ','クリック'],
    ['x390','もつれタップ','クリック'],
    ['x391','観測タップ','クリック'],
    ['x392','崩壊タップ','クリック'],
    ['x393','トンネルタップ','クリック'],
    ['x394','レンズタップ','クリック'],
    ['x395','パルサータップ','クリック'],
    ['x396','ノヴァタップ','クリック'],
    ['x397','超新星タップ','クリック'],
    ['x398','彗星タップ','クリック'],
    ['x399','流星タップ','クリック'],
    ['x400','北極星タップ','クリック'],
    ['x401','ベガタップ','クリック'],
    ['x402','ダブルスリットタップ','クリック'],
    ['x403','確率タップ','クリック'],
    ['x404','重ね合わせタップ','クリック'],
    ['x405','スピンタップ','クリック'],
    ['x406','準位アップタップ','クリック'],
    ['x407','準位ダウンタップ','クリック'],
    ['x408','星図HUD','UI'],
    ['x409','等級HUD','UI'],
    ['x410','赤経HUD','UI'],
    ['x411','赤緯HUD','UI'],
    ['x412','方位HUD','UI'],
    ['x413','高度HUD','UI'],
    ['x414','視線速度HUD','UI'],
    ['x415','等級バー','UI'],
    ['x416','スペクトルバー','UI'],
    ['x417','等級バッジ','UI'],
    ['x418','星座バッジ','UI'],
    ['x419','量子バッジ','UI'],
    ['x420','ミッション星印','UI'],
    ['x421','ログ星屑','UI'],
    ['x422','タブ星線','UI'],
    ['x423','カード星枠','UI'],
    ['x424','ツールチップ星','UI'],
    ['x425','ミニマップ空','UI'],
    ['x426','コンパスHUD','UI'],
    ['x427','観測ログ','UI'],
    ['x428','夜更かし印','UI'],
    ['x429','ファーストライト印','UI'],
    ['x430','ピント合わせ','UI'],
    ['x431','露出バー','UI'],
    ['x432','ISO風','UI'],
    ['x433','回折スパイク','描画'],
    ['x434','エアリーディスク','描画'],
    ['x435','シーイング揺らぎ','描画'],
    ['x436','色収差紫','描画'],
    ['x437','色収差緑','描画'],
    ['x438','コマ収差','描画'],
    ['x439','非点収差','描画'],
    ['x440','歪曲収差','描画'],
    ['x441','ビネッティング円','描画'],
    ['x442','フレアゴースト','描画'],
    ['x443','ブルーム星','描画'],
    ['x444','ソフトフォーカス','描画'],
    ['x445','長時間露光','描画'],
    ['x446','星の軌跡円','描画'],
    ['x447','赤道儀追尾','描画'],
    ['x448','オートガイダ','描画'],
    ['x449','スタック合成','描画'],
    ['x450','ダーク補正風','描画'],
    ['x451','フラット補正風','描画'],
    ['x452','アンシャープ星','描画'],
    ['x453','HDR星雲','描画'],
    ['x454','トーンマップ','描画'],
    ['x455','フィルム粒子','描画'],
    ['x456','ホログラム重畳','描画'],
    ['x457','星座キャッシュ','エンジン'],
    ['x458','シェーダ分岐削減','エンジン'],
    ['x459','星点インスタンス','エンジン'],
    ['x460','線分バッチ','エンジン'],
    ['x461','ワーカー星図','エンジン'],
    ['x462','間引き等級','エンジン'],
    ['x463','遠方LOD','エンジン'],
    ['x464','近傍LOD','エンジン'],
    ['x465','オクルージョン空','エンジン'],
    ['x466','タイル空','エンジン'],
    ['x467','定数バッファ','エンジン'],
    ['x468','ユニフォーム圧縮','エンジン'],
    ['x469','半精度色','エンジン'],
    ['x470','ディザバンディング','エンジン'],
    ['x471','VSync任意','エンジン']
  ];
  const state = {
    on: Object.create(null),
    fps: 0, frames: 0, lastFps: 0,
    quality: 1, mobile: false, hidden: false,
    combo: 0, lastTap: 0, taps: 0,
    hue: 176, pan: 0, workerOk: false, gpuOk: false
  };

  const LIGHT_ON = {
    gpuNebula:1, gpuStars:1, gpuAurora:1, gpuVignette:1, constellation:1,
    bloom:1, halo:1, sparks:1, rings:1, orbit:1,
    autoQuality:1, mobileTune:1, hiDpr:1, pauseHidden:1, fpsCap:0,
    workerSim:1, workerStats:1, softLimiter:1, shimmer:1, subKick:1,
    toastPop:1, additiveBlend:1, starBurst:1, sparkleText:1
  };
  FEATURES.forEach(function(f){ state.on[f[0]] = !!LIGHT_ON[f[0]]; });

  const NE = window.NeonEngine = {
    state: state,
    features: FEATURES,
    playCoreTone: null,
    toast: function(msg){
      var el = document.getElementById("neonToast");
      if (!el) return;
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(NE._tt);
      NE._tt = setTimeout(function(){ el.classList.remove("show"); }, 700);
    }
  };

  var ua = navigator.userAgent||"";
  state.mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  if (state.mobile) state.quality = 0.6;

  var worker = null;
  try {
    var src = "onmessage=function(e){var d=e.data||{};if(d.cmd==='tick'){var t=d.t||0;postMessage({pulse:Math.sin(t*2.0)*0.5+0.5});}};";
    worker = new Worker(URL.createObjectURL(new Blob([src],{type:"text/javascript"})));
    state.workerOk = true;
  } catch (e) { worker = null; }
  var pack = {pulse:0.5};
  if (worker) worker.onmessage = function(e){ if (e.data) pack = e.data; };

  NE.playCoreTone = function(ctx){
    if (!ctx) return;
    var now = ctx.currentTime;
    var det = 0.97 + Math.random()*0.06;
    var pitch = det * (1 + Math.min(12, state.combo) * 0.006);
    var master = ctx.createGain();
    var filt = ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = 1400;
    filt.Q.value = 0.7;
    master.gain.value = 0.22;
    master.connect(filt);
    filt.connect(ctx.destination);
    function voice(f0,f1,dur,vol){
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.type="sine";
      o.frequency.setValueAtTime(f0*pitch, now);
      o.frequency.exponentialRampToValueAtTime(Math.max(40,f1*pitch), now+dur);
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now+dur);
      o.connect(g); g.connect(master);
      o.start(now); o.stop(now+dur+0.03);
    }
    voice(392, 246, 0.11, 0.055);
    voice(523, 330, 0.09, 0.028);
  };

  
  /* NeonRE: lightweight WebGL render engine (2-3 draw calls) */
  var NeonRE = window.NeonRE = null;
  (function initNeonRE(){
    var canvas = document.getElementById("neonThree") || document.getElementById("neonGpuBg");
    if (!canvas) return;
    var gl = canvas.getContext("webgl", {
      alpha:false, antialias:false, depth:false, stencil:false,
      preserveDrawingBuffer:false, powerPreference:"high-performance",
      desynchronized:true
    }) || canvas.getContext("experimental-webgl");
    if (!gl) return;
    function sh(type, src){
      var s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); return s;
    }
    function prog(vs, fs){
      var p=gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p); return p;
    }
    var pBG = prog(
      "attribute vec2 a;varying vec2 v;void main(){v=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}",
      "precision mediump float;varying vec2 v;uniform float t;void main(){vec2 p=v*2.0-1.0;float n=sin(p.x*3.2+t*0.13)*sin(p.y*2.1-t*0.09);float g=exp(-dot(p,p)*1.15);vec3 col=vec3(0.015,0.02,0.07);col+=vec3(0.10,0.04,0.20)*(0.5+0.5*n);col+=vec3(0.00,0.20,0.22)*g*0.55;col+=vec3(0.20,0.08,0.35)*exp(-pow(p.y-0.35-0.08*sin(p.x*4.0+t*0.2),2.0)*8.0)*0.25;gl_FragColor=vec4(col,1.0);}"
    );
    var pStar = prog(
      "attribute vec3 p;attribute float s;uniform float t,asp;void main(){float c=cos(t*0.018),si=sin(t*0.018);vec3 q=vec3(p.x*c-p.z*si,p.y,p.x*si+p.z*c);vec2 sc=q.xy/max(q.z+88.0,8.0);sc.x/=asp;gl_Position=vec4(sc,0.0,1.0);gl_PointSize=s;}",
      "precision mediump float;void main(){vec2 d=gl_PointCoord-0.5;float a=1.0-dot(d,d)*4.0;if(a<=0.0)discard;gl_FragColor=vec4(0.90,0.95,1.0,a);}"
    );
    var pLine = prog(
      "attribute vec3 p;uniform float t,asp;void main(){float c=cos(t*0.018),si=sin(t*0.018);vec3 q=vec3(p.x*c-p.z*si,p.y,p.x*si+p.z*c);vec2 sc=q.xy/max(q.z+88.0,8.0);sc.x/=asp;gl_Position=vec4(sc,0.0,1.0);}",
      "precision mediump float;void main(){gl_FragColor=vec4(0.70,0.86,1.0,0.55);}"
    );
    var pCStar = prog(
      "attribute vec3 p;uniform float t,asp;void main(){float c=cos(t*0.018),si=sin(t*0.018);vec3 q=vec3(p.x*c-p.z*si,p.y,p.x*si+p.z*c);vec2 sc=q.xy/max(q.z+88.0,8.0);sc.x/=asp;gl_Position=vec4(sc,0.0,1.0);gl_PointSize=3.2;}",
      "precision mediump float;void main(){vec2 d=gl_PointCoord-0.5;float a=1.0-dot(d,d)*4.2;if(a<=0.0)discard;gl_FragColor=vec4(1.0,0.95,0.75,a);}"
    );
    var quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

    var mobile = !!(window.NeonEngine && NeonEngine.state && NeonEngine.state.mobile) || /Mobile|Android|iPhone/i.test(navigator.userAgent||"");
    var nStar = mobile ? 520 : 900;
    var star = new Float32Array(nStar*4);
    var i,r,th,ph;
    for(i=0;i<nStar;i++){
      r=36+Math.random()*54; th=Math.random()*6.28318; ph=Math.acos(2*Math.random()-1);
      star[i*4]=r*Math.sin(ph)*Math.cos(th);
      star[i*4+1]=r*Math.cos(ph);
      star[i*4+2]=r*Math.sin(ph)*Math.sin(th);
      star[i*4+3]=mobile?1.4:1.8;
    }
    var starBuf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, starBuf);
    gl.bufferData(gl.ARRAY_BUFFER, star, gl.STATIC_DRAW);

    function uv3(u,v,R){
      var a=u*6.28318, b=(0.22+v*0.56)*3.14159;
      return [R*Math.sin(b)*Math.cos(a), R*Math.cos(b)*0.85, R*Math.sin(b)*Math.sin(a)];
    }
    var CATALOG = [
      [[0.18,0.22],[0.24,0.20],[0.30,0.21],[0.35,0.26],[0.41,0.25],[0.46,0.20],[0.52,0.18]],
      [[0.58,0.16],[0.63,0.12],[0.68,0.16],[0.73,0.11],[0.79,0.15]],
      [[0.62,0.48],[0.66,0.52],[0.70,0.48],[0.64,0.58],[0.69,0.60],[0.60,0.40],[0.72,0.39]],
      [[0.28,0.38],[0.32,0.42],[0.30,0.47],[0.25,0.45],[0.28,0.38]],
      [[0.40,0.34],[0.46,0.32],[0.52,0.34],[0.46,0.26],[0.46,0.40]],
      [[0.78,0.62],[0.82,0.70],[0.80,0.58],[0.86,0.64]],
      [[0.14,0.50],[0.22,0.48],[0.24,0.56],[0.16,0.58],[0.14,0.50]],
      [[0.70,0.72],[0.74,0.70],[0.78,0.72],[0.81,0.76],[0.80,0.82],[0.76,0.86],[0.72,0.84]],
      [[0.30,0.40],[0.46,0.32],[0.22,0.28],[0.30,0.40]],
      [[0.66,0.52],[0.78,0.36],[0.58,0.36],[0.66,0.52]]
    ];
    var lines=[], bright=[];
    CATALOG.forEach(function(pts){
      var P=pts.map(function(p){return uv3(p[0],p[1],48);});
      for(var k=0;k<P.length;k++){
        bright.push(P[k][0],P[k][1],P[k][2]);
        if(k){ var a=P[k-1],b=P[k]; lines.push(a[0],a[1],a[2],b[0],b[1],b[2]); }
      }
    });
    var lineBuf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
    var cstarBuf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cstarBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bright), gl.STATIC_DRAW);

    var locA = gl.getAttribLocation(pBG,"a");
    var uBGt = gl.getUniformLocation(pBG,"t");
    var locSP = gl.getAttribLocation(pStar,"p");
    var locSS = gl.getAttribLocation(pStar,"s");
    var uSt = gl.getUniformLocation(pStar,"t");
    var uSasp = gl.getUniformLocation(pStar,"asp");
    var locLP = gl.getAttribLocation(pLine,"p");
    var uLt = gl.getUniformLocation(pLine,"t");
    var uLasp = gl.getUniformLocation(pLine,"asp");
    var locCP = gl.getAttribLocation(pCStar,"p");
    var uCt = gl.getUniformLocation(pCStar,"t");
    var uCasp = gl.getUniformLocation(pCStar,"asp");

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    function resize(){
      var dpr = 1;
      var w=Math.max(1,innerWidth), h=Math.max(1,innerHeight);
      var W=Math.floor(w*dpr), H=Math.floor(h*dpr);
      if (canvas.width!==W || canvas.height!==H){
        canvas.width=W; canvas.height=H;
        canvas.style.width=w+"px"; canvas.style.height=h+"px";
        gl.viewport(0,0,W,H);
      }
    }
    resize();
    addEventListener("resize", resize, {passive:true});

    NeonRE = window.NeonRE = {
      gl:gl, ready:true,
      render: function(now){
        resize();
        var t=now*0.001, asp=canvas.width/Math.max(1,canvas.height);
        gl.viewport(0,0,canvas.width,canvas.height);
        gl.disable(gl.BLEND);
        gl.useProgram(pBG);
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        gl.enableVertexAttribArray(locA);
        gl.vertexAttribPointer(locA,2,gl.FLOAT,false,0,0);
        gl.uniform1f(uBGt,t);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

        gl.enable(gl.BLEND);
        gl.useProgram(pStar);
        gl.bindBuffer(gl.ARRAY_BUFFER, starBuf);
        gl.enableVertexAttribArray(locSP);
        gl.enableVertexAttribArray(locSS);
        gl.vertexAttribPointer(locSP,3,gl.FLOAT,false,16,0);
        gl.vertexAttribPointer(locSS,1,gl.FLOAT,false,16,12);
        gl.uniform1f(uSt,t); gl.uniform1f(uSasp,asp);
        gl.drawArrays(gl.POINTS,0,nStar);

        if (state.on.constellation || state.on.starBurst){
          gl.useProgram(pLine);
          gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
          gl.enableVertexAttribArray(locLP);
          gl.vertexAttribPointer(locLP,3,gl.FLOAT,false,0,0);
          gl.uniform1f(uLt,t); gl.uniform1f(uLasp,asp);
          gl.drawArrays(gl.LINES,0,lines.length/3);
          gl.useProgram(pCStar);
          gl.bindBuffer(gl.ARRAY_BUFFER, cstarBuf);
          gl.enableVertexAttribArray(locCP);
          gl.vertexAttribPointer(locCP,3,gl.FLOAT,false,0,0);
          gl.uniform1f(uCt,t); gl.uniform1f(uCasp,asp);
          gl.drawArrays(gl.POINTS,0,bright.length/3);
        }
      }
    };
    state.gpuOk = true;
    var hide=document.getElementById("neonGpuBg");
    if (hide) hide.style.display="none";
  })();
  var threeSky = null;
  var bg = document.getElementById("neonGpuBg");
  var gl = null, gpu = null, lastW=0, lastH=0;
var fxC=document.getElementById("neonFxOverlay");
  var fx=fxC?fxC.getContext("2d",{alpha:true}):null;
  var CAP = state.mobile ? 48 : 90;
  var parts = new Array(CAP);
  var pCount = 0;
  function spawn(kind,x,y,n){
    n = n || (state.mobile?3:6);
    var i;
    for(i=0;i<n;i++){
      if(pCount>=CAP){ pCount=CAP-6; }
      var a=Math.random()*6.283, sp=0.4+Math.random()*2.6;
      parts[pCount++] = {kind:kind,x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,decay:0.02+Math.random()*0.02,s:1+Math.random()*2,hue:(state.hue+Math.random()*50)%360};
    }
  }

  var CONSTELS = [
    {n:"北斗七星", pts:[[0.18,0.22],[0.24,0.20],[0.30,0.21],[0.35,0.26],[0.41,0.25],[0.46,0.20],[0.52,0.18]]},
    {n:"カシオペヤ", pts:[[0.58,0.16],[0.63,0.12],[0.68,0.16],[0.73,0.11],[0.79,0.15]]},
    {n:"オリオン", pts:[[0.62,0.48],[0.66,0.52],[0.70,0.48],[0.64,0.58],[0.69,0.60],[0.60,0.40],[0.72,0.39]]},
    {n:"こと座", pts:[[0.28,0.38],[0.32,0.42],[0.30,0.47],[0.25,0.45],[0.28,0.38]]},
    {n:"はくちょう", pts:[[0.40,0.34],[0.46,0.32],[0.52,0.34],[0.46,0.26],[0.46,0.40]]},
    {n:"南十字", pts:[[0.78,0.62],[0.82,0.70],[0.80,0.58],[0.86,0.64]]}
  ];
  var skyAng = 0;

  function fit(){
    var dpr = Math.min(state.on.hiDpr ? 1.1 : 1.35, window.devicePixelRatio||1);
    var q = state.quality;
    var w=Math.max(1,innerWidth), h=Math.max(1,innerHeight);
    var gw=Math.max(1,Math.floor(w*dpr*q)), gh=Math.max(1,Math.floor(h*dpr*q));
    if (bg && (gw!==lastW || gh!==lastH)){
      bg.width=gw; bg.height=gh;
      bg.style.width=w+"px"; bg.style.height=h+"px";
      lastW=gw; lastH=gh;
      if (gl) gl.viewport(0,0,gw,gh);
    }
    if (fxC){
      var fw=Math.max(1,Math.floor(w*Math.min(dpr,1.05)*Math.max(0.4,q*0.85)));
      var fh=Math.max(1,Math.floor(h*Math.min(dpr,1.05)*Math.max(0.4,q*0.85)));
      if (fxC.width!==fw || fxC.height!==fh){
        fxC.width=fw; fxC.height=fh;
        fxC.style.width=w+"px"; fxC.style.height=h+"px";
      }
    }
  }
  var resizeT=0;
  addEventListener("resize", function(){ clearTimeout(resizeT); resizeT=setTimeout(fit,120); }, {passive:true});
  fit();
  document.addEventListener("visibilitychange", function(){
    state.hidden = document.hidden && !!state.on.pauseHidden;
  });

  var last=performance.now(), skip=0, fxTick=0, wkAcc=0;
  function frame(now){
    requestAnimationFrame(frame);
    if (state.hidden) return;
    var dt = Math.min(0.05, (now-last)/1000);
    last = now;
    state.frames++;
    if (now - state.lastFps >= 500){
      state.fps = Math.round(state.frames * 1000 / Math.max(1, now - state.lastFps));
      state.frames = 0;
      state.lastFps = now;
      var fpsTxt = String(state.fps);
      var el = document.getElementById("neonFps");
      if (el) el.textContent = fpsTxt;
      var eh = document.getElementById("eh-fps");
      if (eh) eh.textContent = fpsTxt;
      if (state.on.autoQuality){
        if (state.fps && state.fps < 42) state.quality = Math.max(0.35, state.quality - 0.08);
        else if (state.fps > 56) state.quality = Math.min(state.mobile?0.7:0.9, state.quality + 0.03);
      }
    }
    if (state.on.paletteCycle) state.hue = (state.hue + dt*8) % 360;

    wkAcc += dt;
    if (worker && state.on.workerSim && wkAcc > 0.12){
      worker.postMessage({cmd:"tick", t: now*0.001});
      wkAcc = 0;
    }

    if (NeonRE && NeonRE.render){
      try { NeonRE.render(now); } catch (e) { NeonRE = null; }
    }

    fxTick++;
    if (fx && fxC && pCount>0){
      var w=fxC.width, h=fxC.height;
      fx.clearRect(0,0,w,h);
      if (false && state.on.constellation){
        skyAng += 0.0007;
        var cx=w*0.5, cy=h*0.40, ca=Math.cos(skyAng), sa=Math.sin(skyAng);
        fx.lineWidth = 1;
        var ci, pj, pts, x,y,u,v,px,py;
        for (ci=0; ci<CONSTELS.length; ci++){
          pts = CONSTELS[ci].pts;
          fx.strokeStyle = "rgba(180,210,255,0.28)";
          fx.beginPath();
          for (pj=0; pj<pts.length; pj++){
            u=pts[pj][0]-0.5; v=pts[pj][1]-0.45;
            px = cx + (u*w)*ca - (v*h)*sa;
            py = cy + (u*w)*sa + (v*h)*ca;
            if (pj) fx.lineTo(px,py); else fx.moveTo(px,py);
          }
          fx.stroke();
          fx.fillStyle = "rgba(255,240,190,0.85)";
          for (pj=0; pj<pts.length; pj++){
            u=pts[pj][0]-0.5; v=pts[pj][1]-0.45;
            px = cx + (u*w)*ca - (v*h)*sa;
            py = cy + (u*w)*sa + (v*h)*ca;
            fx.fillRect(px-1.2, py-1.2, 2.4, 2.4);
          }
        }
      }
      var write=0, i, p;
      for (i=0;i<pCount;i++){
        p=parts[i];
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.02; p.life-=p.decay;
        if (p.life<=0) continue;
        parts[write++]=p;
        fx.globalAlpha=p.life;
        if (p.kind==="ring"){
          fx.strokeStyle="hsla("+p.hue+",90%,62%,"+p.life+")";
          fx.beginPath(); fx.arc(p.x,p.y,(1-p.life)*28+5,0,6.28); fx.stroke();
        } else {
          fx.fillStyle="hsl("+p.hue+",90%,68%)";
          fx.fillRect(p.x,p.y,p.s,p.s);
        }
      }
      pCount=write;
      fx.globalAlpha=1;
      var fxn=document.getElementById("neonFxN"); if (fxn) fxn.textContent=String(pCount);
    }
  }
  requestAnimationFrame(frame);

  document.addEventListener("pointerdown", function(ev){
    var t=ev.target;
    if (!(t && t.closest && t.closest("#coreTrigger"))) return;
    var now=performance.now();
    state.combo = (now-state.lastTap<900) ? state.combo+1 : 1;
    state.lastTap=now; state.taps++;
    var x=(ev.clientX||innerWidth/2) * (fxC?fxC.width/innerWidth:1);
    var y=(ev.clientY||innerHeight/2) * (fxC?fxC.height/innerHeight:1);
    if (state.on.sparks) spawn("spark",x,y, state.mobile?3:6);
    if (state.on.rings) spawn("ring",x,y,2);
    if (state.on.haptics && navigator.vibrate){ try{navigator.vibrate(5);}catch(e){} }
    if (state.on.toastPop && state.combo && state.combo%10===0) NE.toast("COMBO "+state.combo);
  }, {passive:true});

  var grid=document.getElementById("neonFeatGrid");
  var catsBox=document.getElementById("neonFeatCats");
  var searchBox=document.getElementById("neonFeatSearch");
  var catFilter="星座";
  function countOn(){
    var n=0, i;
    for(i=0;i<FEATURES.length;i++) if (state.on[FEATURES[i][0]]) n++;
    var el=document.getElementById("neonFeatCount"); if(el) el.textContent=n+"/"+FEATURES.length;
    var g=document.getElementById("neonGpu"); if(g) g.textContent=state.gpuOk?"ON":"2D";
    var w=document.getElementById("neonWk"); if(w) w.textContent=state.workerOk?"ON":"OFF";
  }
  function paintGrid(){
    if (!grid) return;
    var q=(searchBox && searchBox.value || "").trim().toLowerCase();
    grid.textContent="";
    var frag=document.createDocumentFragment();
    var shown=0, i, k,label,cat,b;
    for(i=0;i<FEATURES.length;i++){
      k=FEATURES[i][0]; label=FEATURES[i][1]; cat=FEATURES[i][2]||"";
      if (catFilter!=="すべて" && cat!==catFilter) continue;
      if (q && label.toLowerCase().indexOf(q)<0 && cat.indexOf(q)<0) continue;
      if (shown>80 && !q) break;
      b=document.createElement("button");
      b.type="button"; b.className="nd"+(state.on[k]?" on":"");
      b.textContent=label;
      b.addEventListener("click", (function(key,btn){
        return function(ev){ ev.stopPropagation(); state.on[key]=!state.on[key]; btn.classList.toggle("on", state.on[key]); countOn(); };
      })(k,b));
      frag.appendChild(b);
      shown++;
    }
    grid.appendChild(frag);
  }
  if (catsBox){
    var names=["星座","宇宙","量子","粒子","音","色","クリック","UI","描画","エンジン","すべて"];
    names.forEach(function(name){
      var b=document.createElement("button");
      b.type="button"; b.textContent=name; if(name===catFilter) b.className="on";
      b.addEventListener("click", function(ev){
        ev.stopPropagation();
        catFilter=name;
        var ch=catsBox.children, i;
        for(i=0;i<ch.length;i++) ch[i].classList.toggle("on", ch[i]===b);
        paintGrid();
      });
      catsBox.appendChild(b);
    });
  }
  if (searchBox){
    searchBox.addEventListener("input", paintGrid);
    searchBox.addEventListener("click", function(ev){ ev.stopPropagation(); });
  }
  var dock=document.getElementById("neonDock");
  var head=document.getElementById("neonDockHead");
  var painted=false;
  if (head && dock){
    head.addEventListener("click", function(){
      dock.classList.toggle("collapsed");
      if (!dock.classList.contains("collapsed") && !painted){ paintGrid(); painted=true; }
    });
  }
  countOn();

  function hookSM(){
    if (!window.SoundManager || !SoundManager.playClick) return;
    var orig=SoundManager.playClick.bind(SoundManager);
    SoundManager.playClick=function(){
      try{
        SoundManager.init && SoundManager.init();
        if (SoundManager.ctx){ NE.playCoreTone(SoundManager.ctx); return; }
      }catch(e){}
      orig();
    };
  }
  if (document.readyState==="complete") hookSM();
  else addEventListener("load", hookSM);
})();
