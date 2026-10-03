/**
 * PKMN CHAMPIONS MOVE SEARCH APPLICATION - CORE ENGINE (app.js)
 * 
 * すべての主要データ (pokemonData, movesData, abilitiesData, learnsetsData, typesData等) は
 * HTMLで先行ロードされており、グローバルスコープの定数としてアクセス可能です。
 */

(function () {
    'use strict';

    // 選択状態の保存リスト（3スロット: 0, 1, 2）
    // 保存フォーマット: null または { categoryType: 'move'|'ability', data: move|ability }
    const selectedSlots = [null, null, null];

    // 現在のテーブルソート設定
    let currentSortField = null; // 'hp', 'atk', 'def', 'spa', 'spd', 'spe', 'nameJa'
    let currentSortOrder = 'desc'; // 'desc' or 'asc'

    // 検索用統合マスターデータの構築
    let searchableItems = [];

    // ポケモン詳細用の選択状態
    let selectedPokemon = null;

    // 中央テーブルのタイプ絞り込み用
    let selectedTypeFilter = null;

    // メガシンカ除外フラグ
    let excludeMega = false;

    // ポケモン名検索クエリ
    let pokemonNameFilter = '';

    // ポケモン詳細内の覚える技一覧絞り込み用
    let moveTypeFilter = null;
    let moveCategoryFilter = null;
    let movePriorityFilter = null;

    // タイプ相性表 (攻撃側タイプ -> 防御側タイプへの効果倍率)
    const TYPE_CHART = {
        Normal: { Rock: 0.5, Steel: 0.5, Ghost: 0 },
        Fire: { Grass: 2, Ice: 2, Bug: 2, Steel: 2, Fire: 0.5, Water: 0.5, Rock: 0.5, Dragon: 0.5 },
        Water: { Fire: 2, Ground: 2, Rock: 2, Water: 0.5, Grass: 0.5, Dragon: 0.5 },
        Grass: { Water: 2, Ground: 2, Rock: 2, Fire: 0.5, Grass: 0.5, Poison: 0.5, Flying: 0.5, Bug: 0.5, Dragon: 0.5, Steel: 0.5 },
        Electric: { Water: 2, Flying: 2, Electric: 0.5, Grass: 0.5, Dragon: 0.5, Ground: 0 },
        Ice: { Grass: 2, Ground: 2, Flying: 2, Dragon: 2, Fire: 0.5, Water: 0.5, Ice: 0.5, Steel: 0.5 },
        Fighting: { Normal: 2, Ice: 2, Rock: 2, Dark: 2, Steel: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Fairy: 0.5, Ghost: 0 },
        Poison: { Grass: 2, Fairy: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0 },
        Ground: { Fire: 2, Electric: 2, Poison: 2, Rock: 2, Steel: 2, Grass: 0.5, Bug: 0.5, Flying: 0 },
        Flying: { Grass: 2, Fighting: 2, Bug: 2, Electric: 0.5, Rock: 0.5, Steel: 0.5 },
        Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Steel: 0.5, Dark: 0 },
        Bug: { Grass: 2, Psychic: 2, Dark: 2, Fire: 0.5, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Ghost: 0.5, Steel: 0.5, Fairy: 0.5 },
        Rock: { Fire: 2, Ice: 2, Flying: 2, Bug: 2, Fighting: 0.5, Ground: 0.5, Steel: 0.5 },
        Ghost: { Psychic: 2, Ghost: 2, Dark: 0.5, Normal: 0 },
        Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
        Dark: { Psychic: 2, Ghost: 2, Fighting: 0.5, Dark: 0.5, Fairy: 0.5 },
        Steel: { Ice: 2, Rock: 2, Fairy: 2, Fire: 0.5, Water: 0.5, Electric: 0.5, Steel: 0.5 },
        Fairy: { Fighting: 2, Dragon: 2, Dark: 2, Fire: 0.5, Poison: 0.5, Steel: 0.5 }
    };
    const typeChart = TYPE_CHART;

    // タイプ相性検索用の状態
    const typeMatchupFilters = {};

    /**
     * 初期化処理
     */
    function init() {
        buildSearchIndex();
        setupTabNavigation();
        setupSlotEvents();
        renderTypeMatchupGrid();
        setupTypeMatchupEvents();
        setupTableSortEvents();
        setupTableClickEvents();
        setupExcludeMegaEvent();
        setupPokemonNameSearchEvent();
        updatePokemonList(); // 初期状態は未選択のため全ポケモンを表示
        renderPokemonDetails(); // 初期プレースホルダー描画

        console.log("⚡ PKMN Champions Move Search Portal initialized successfully.");
    }

    /**
     * タブナビゲーションの設定
     */
    function setupTabNavigation() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                const targetId = e.target.getAttribute('data-target');
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                document.getElementById(targetId).classList.add('active');
            });
        });
    }

    /**
     * タイプ相性検索グリッドの描画
     */
    function renderTypeMatchupGrid() {
        const gridEl = document.getElementById('type-matchup-grid');
        if (!gridEl) return;

        gridEl.innerHTML = '';

        if (typeof typesData !== 'undefined' && Array.isArray(typesData)) {
            typesData.forEach(type => {
                typeMatchupFilters[type.id] = { '2': false, '1': false, '0.5': false, '0': false };

                const row = document.createElement('div');
                row.className = 'type-matchup-row';

                const leftDiv = document.createElement('div');
                leftDiv.className = 'type-matchup-row-left';
                leftDiv.innerHTML = `
                    <img src="icons/types/${type.id}.svg" alt="${type.nameJa}" class="type-icon-img" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\'></svg>'">
                    <span class="type-label">${type.nameJa}</span>
                `;

                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'type-matchup-options';

                const options = [
                    { value: '2', label: '2倍' },
                    { value: '1', label: '等倍' },
                    { value: '0.5', label: '半減' },
                    { value: '0', label: '無効' }
                ];

                options.forEach(opt => {
                    const label = document.createElement('label');
                    label.className = 'type-matchup-checkbox-label';
                    
                    const cb = document.createElement('input');
                    cb.type = 'checkbox';
                    cb.value = opt.value;
                    cb.dataset.typeId = type.id;
                    
                    cb.addEventListener('change', (e) => {
                        typeMatchupFilters[type.id][opt.value] = e.target.checked;
                        updatePokemonList();
                    });

                    const span = document.createElement('span');
                    span.className = 'matchup-btn';
                    span.textContent = opt.label;

                    label.appendChild(cb);
                    label.appendChild(span);
                    optionsDiv.appendChild(label);
                });

                row.appendChild(leftDiv);
                row.appendChild(optionsDiv);
                gridEl.appendChild(row);
            });
        }
    }

    /**
     * タイプ相性リセットイベントの設定
     */
    function setupTypeMatchupEvents() {
        const clearBtn = document.getElementById('btn-clear-type-matchup');
        if (!clearBtn) return;

        clearBtn.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.type-matchup-checkbox-label input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = false;
                typeMatchupFilters[cb.dataset.typeId][cb.value] = false;
            });
            updatePokemonList();
        });
    }

    /**
     * ポケモンのタイプから、特定の攻撃タイプに対するダメージ倍率を計算する
     */
    function getDefensiveMultiplier(defenderTypes, attackerType) {
        if (!defenderTypes || !attackerType) return 1;
        
        const atkKey = attackerType.charAt(0).toUpperCase() + attackerType.slice(1).toLowerCase();
        const attackInfo = TYPE_CHART[atkKey];
        if (!attackInfo) return 1;

        let multiplier = 1;
        defenderTypes.forEach(defType => {
            const defKey = defType.charAt(0).toUpperCase() + defType.slice(1).toLowerCase();
            if (attackInfo[defKey] !== undefined) {
                multiplier *= attackInfo[defKey];
            }
        });

        return multiplier;
    }

    /**
     * タイプ相性フィルターを満たすかどうか判定
     */
    function passesTypeMatchupFilter(pokemon) {
        if (!pokemon.types || !Array.isArray(pokemon.types)) return true;
        const pTypes = pokemon.types;
        
        for (const attackTypeId in typeMatchupFilters) {
            const filters = typeMatchupFilters[attackTypeId];
            const isAnyChecked = filters['2'] || filters['1'] || filters['0.5'] || filters['0'];
            const isAllChecked = filters['2'] && filters['1'] && filters['0.5'] && filters['0'];

            if (!isAnyChecked || isAllChecked) continue;

            const multiplier = getDefensiveMultiplier(pTypes, attackTypeId);
            
            let cat = '1';
            if (multiplier > 1) cat = '2';
            else if (multiplier === 0) cat = '0';
            else if (multiplier < 1) cat = '0.5';

            if (!filters[cat]) {
                return false;
            }
        }
        return true;
    }

    /**
     * ポケモン名検索（ひらがな・カタカナ対応）のイベント設定
     */
    function setupPokemonNameSearchEvent() {
        const inputEl = document.getElementById('pokemon-search-input');
        const clearBtnEl = document.getElementById('clear-pokemon-search');
        if (!inputEl) return;

        inputEl.addEventListener('input', (e) => {
            pokemonNameFilter = e.target.value.trim();
            if (clearBtnEl) {
                clearBtnEl.style.display = pokemonNameFilter.length > 0 ? 'inline-block' : 'none';
            }
            updatePokemonList();
        });

        if (clearBtnEl) {
            clearBtnEl.addEventListener('click', () => {
                inputEl.value = '';
                pokemonNameFilter = '';
                clearBtnEl.style.display = 'none';
                updatePokemonList();
                inputEl.focus();
            });
        }

        // Escapeキーでクリア
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && pokemonNameFilter !== '') {
                inputEl.value = '';
                pokemonNameFilter = '';
                if (clearBtnEl) clearBtnEl.style.display = 'none';
                updatePokemonList();
            }
        });
    }

    /**
     * メガを除くチェックボックスのイベント設定
     */
    function setupExcludeMegaEvent() {
        const checkboxEl = document.getElementById('exclude-mega-checkbox');
        if (!checkboxEl) return;
        checkboxEl.addEventListener('change', (e) => {
            excludeMega = e.target.checked;
            updatePokemonList();
        });
    }

    /**
     * 技 (movesData) と 特性 (abilitiesData) を検索しやすいように配列へ統合・インデックス化
     */
    function buildSearchIndex() {
        searchableItems = [];

        // 技データの登録
        if (typeof movesData !== 'undefined' && Array.isArray(movesData)) {
            movesData.forEach(m => {
                // 有効なデータのみロード (名前が存在するもの)
                if (m.nameJa || m.name) {
                    searchableItems.push({
                        itemType: 'move',
                        id: m.id,
                        name: m.name,
                        nameJa: m.nameJa || m.name,
                        category: m.category,      // "Physical", "Special", "Status"
                        type: m.type,              // "Rock", "Water" 等
                        basePower: m.basePower,
                        accuracy: m.accuracy,
                        priority: m.priority,
                        desc: m.desc || m.shortDesc || "詳しい効果の説明文はありません。",
                        raw: m
                    });
                }
            });
        }

        // 特性データの登録
        if (typeof abilitiesData !== 'undefined' && Array.isArray(abilitiesData)) {
            abilitiesData.forEach(a => {
                if (a.nameJa || a.name) {
                    searchableItems.push({
                        itemType: 'ability',
                        id: a.id,
                        name: a.name,              // 英語名（ポケモンデータのabilitiesとのマッチングキー）
                        nameJa: a.nameJa || a.name,
                        category: 'Ability',
                        desc: a.desc || a.shortDesc || "詳しい効果の説明文はありません。",
                        raw: a
                    });
                }
            });
        }
    }

    /**
     * ひらがな・カタカナ両対応のための正規化関数
     * カタカナをひらがなに変換し、全角半角や大文字小文字の違いを吸収する
     */
    function normalizeForSearch(str) {
        if (!str) return '';
        // 全角英数字およびカタカナの基礎正規化
        return str.toString()
            .trim()
            .toLowerCase()
            .replace(/[\u30a1-\u30f6]/g, function (match) {
                // カタカナ(ァ-ヶ) を ひらがな(ぁ-け) にコード変換
                return String.fromCharCode(match.charCodeAt(0) - 0x60);
            })
            .replace(/[\u3000]/g, ' '); // 全角スペースを半角へ
    }

    /**
     * 技・特性カテゴリーに応じたアイコン絵文字を返却
     */
    function getCategoryIcon(item) {
        if (item.itemType === 'ability') {
            return '🧬'; // 特性のアイコン
        }
        // 技の場合: moves.jsのcategoryに合わせたアイコン
        switch (item.category) {
            case 'Physical': return '💥';
            case 'Special': return '🌀';
            case 'Status': return '☯️';
            default: return '💠';
        }
    }

    /**
     * 3つの選択スロット関連のイベントリスナー設定
     */
    function setupSlotEvents() {
        for (let i = 0; i < 3; i++) {
            const inputEl = document.getElementById(`search-input-${i}`);
            const dropdownEl = document.getElementById(`dropdown-list-${i}`);
            const clearBtnEl = document.getElementById(`clear-btn-${i}`);

            if (!inputEl || !dropdownEl) continue;

            // 入力監視によるリアルタイムドロップダウン更新
            inputEl.addEventListener('input', (e) => {
                const query = e.target.value;
                handleSearchInput(i, query);
            });

            // キーボード操作 (Enter/Tabで最上位結果を即時選択)
            inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                    // ドロップダウンが開いていて、かつ候補がある場合のみ自動決定
                    if (dropdownEl.style.display === 'block' && dropdownEl.querySelector('.dropdown-item')) {
                        e.preventDefault();
                        selectTopDropdownItem(i);
                    }
                } else if (e.key === 'Escape') {
                    dropdownEl.style.display = 'none';
                }
            });

            // 解除ボタンクリック時
            if (clearBtnEl) {
                clearBtnEl.addEventListener('click', () => {
                    clearSlot(i);
                });
            }
        }

        // 外部クリックでドロップダウンを閉じる
        document.addEventListener('click', (e) => {
            for (let i = 0; i < 3; i++) {
                const wrapper = document.getElementById(`slot-container-${i}`);
                const dropdown = document.getElementById(`dropdown-list-${i}`);
                if (wrapper && dropdown && !wrapper.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            }
        });
    }

    /**
     * 入力内容をもとにサジェスト上位5件をドロップダウン表示
     */
    function handleSearchInput(slotIndex, query) {
        const dropdownEl = document.getElementById(`dropdown-list-${slotIndex}`);
        const normalizedQuery = normalizeForSearch(query);

        if (!normalizedQuery || normalizedQuery.length === 0) {
            dropdownEl.style.display = 'none';
            dropdownEl.innerHTML = '';
            return;
        }

        // ヒット項目を検索・フィルタリング (平仮名・片仮名の両対応)
        const matchedItems = searchableItems.filter(item => {
            const normalizedName = normalizeForSearch(item.nameJa);
            const normalizedEng = normalizeForSearch(item.name);
            return normalizedName.includes(normalizedQuery) || normalizedEng.includes(normalizedQuery);
        });

        // 仕様書の規定に基づき、上位5個までをドロップダウンに抽出
        const topResults = matchedItems.slice(0, 5);

        if (topResults.length === 0) {
            dropdownEl.style.display = 'none';
            dropdownEl.innerHTML = '';
            return;
        }

        // リスト項目のDOM生成
        dropdownEl.innerHTML = '';
        topResults.forEach((item, idx) => {
            const li = document.createElement('li');
            li.className = 'dropdown-item' + (idx === 0 ? ' active' : '');
            li.setAttribute('role', 'option');
            li.tabIndex = 0;

            const icon = getCategoryIcon(item);

            li.innerHTML = `
                <span class="item-icon">${icon}</span>
                <span class="item-label">${item.nameJa}</span>
            `;

            // リスト項目のクリックイベント
            li.addEventListener('click', () => {
                selectItem(slotIndex, item);
            });

            dropdownEl.appendChild(li);
        });

        dropdownEl.style.display = 'block';
    }

    /**
     * Enter押下時に現在表示されているドロップダウンの先頭項目を選出
     */
    function selectTopDropdownItem(slotIndex) {
        const dropdownEl = document.getElementById(`dropdown-list-${slotIndex}`);
        if (!dropdownEl || dropdownEl.style.display === 'none') return;

        const firstItemEl = dropdownEl.querySelector('.dropdown-item');
        if (firstItemEl) {
            firstItemEl.click();
        }
    }

    /**
     * アイテムをスロットに選択・固定反映する
     */
    function selectItem(slotIndex, item) {
        selectedSlots[slotIndex] = item;

        // 入力欄とドロップダウンのリセット
        const inputEl = document.getElementById(`search-input-${slotIndex}`);
        const dropdownEl = document.getElementById(`dropdown-list-${slotIndex}`);
        const clearBtnEl = document.getElementById(`clear-btn-${slotIndex}`);

        if (inputEl) inputEl.value = '';
        if (dropdownEl) dropdownEl.style.display = 'none';
        if (clearBtnEl) clearBtnEl.style.display = 'inline-block';

        // 表示用カードの描画更新
        renderSlotCard(slotIndex);

        // ポケモン一覧のフィルタ・更新
        updatePokemonList();
    }

    /**
     * スロットの選択解除
     */
    function clearSlot(slotIndex) {
        selectedSlots[slotIndex] = null;

        const clearBtnEl = document.getElementById(`clear-btn-${slotIndex}`);
        const displayEl = document.getElementById(`selected-display-${slotIndex}`);

        if (clearBtnEl) clearBtnEl.style.display = 'none';
        if (displayEl) {
            displayEl.className = 'selected-card-display';
            displayEl.innerHTML = `
                <div class="empty-placeholder">
                    <span>上部の入力欄から技または特性を検索してセット</span>
                </div>
            `;
        }

        updatePokemonList();
    }

    /**
     * 選択済みスロットのカード描画（技威力、命中、優先度等を含む）
     */
    function renderSlotCard(slotIndex) {
        const item = selectedSlots[slotIndex];
        const displayEl = document.getElementById(`selected-display-${slotIndex}`);
        if (!displayEl || !item) return;

        displayEl.className = 'selected-card-display has-item';

        const icon = getCategoryIcon(item);

        let html = `
            <div class="card-content">
                <div class="card-title-row">
                    <span class="item-icon">${icon}</span>
        `;

        // 技の場合のタイプアイコン表示
        if (item.itemType === 'move' && item.type) {
            const typeLower = item.type.toLowerCase();
            html += `<span class="type-icon-wrapper"><img src="icons/types/${typeLower}.svg" alt="${item.type}" class="type-icon-img" title="${item.type}"></span>`;
        }

        html += `
                    <span class="card-item-name">${item.nameJa}</span>
                </div>
        `;

        // 技のパラメータ情報 (威力、命中、優先度)
        if (item.itemType === 'move') {
            const powerText = item.basePower !== undefined ? item.basePower : '0';
            const accText = item.accuracy === true ? '必中' : (item.accuracy || '-');

            html += `
                <div class="card-stats-row">
                    <div class="stat-chip">
                        <span class="label">威力</span>
                        <span class="val">${powerText}</span>
                    </div>
                    <div class="stat-chip">
                        <span class="label">命中</span>
                        <span class="val">${accText}</span>
                    </div>
            `;

            // 優先度: priorityが0以外の場合のみ表示（正の数値には先頭に+を付与）
            if (item.priority !== undefined && item.priority !== 0) {
                const priorityText = item.priority > 0 ? `+${item.priority}` : `${item.priority}`;
                html += `
                    <div class="stat-chip">
                        <span class="label">優先度</span>
                        <span class="val val-priority">${priorityText}</span>
                    </div>
                `;
            }

            html += `</div>`;
        }

        // 効果説明文
        html += `
                <div class="card-desc">${item.desc}</div>
            </div>
        `;

        displayEl.innerHTML = html;
    }

    /**
     * 中央ポケモン一覧の更新（複数スロットのAND条件フィルタ＆ソート）
     */
    function updatePokemonList() {
        if (typeof pokemonData === 'undefined' || !Array.isArray(pokemonData)) {
            console.error("ポケモンデータが読み込まれていません。");
            return;
        }

        // 現在有効な選択アイテムを取り出し
        const activeItems = selectedSlots.filter(item => item !== null);

        // AND条件での絞り込み処理
        let filteredPokemon = pokemonData.filter(p => {
            // メガシンカを除くチェック時の判定（メガニウム等は除く）
            if (excludeMega) {
                const isMega = (p.name && p.name.includes('-Mega')) || (p.nameJa && p.nameJa.startsWith('メガ') && p.nameJa !== 'メガニウム' && p.nameJa !== 'メガヤンマ');
                if (isMega) return false;
            }

            // ポケモン名検索による絞り込み（ひらがな・カタカナ・英名の両対応）
            if (pokemonNameFilter && pokemonNameFilter.length > 0) {
                const normalizedQuery = normalizeForSearch(pokemonNameFilter);
                const normalizedJa = normalizeForSearch(p.nameJa);
                const normalizedEn = normalizeForSearch(p.name);
                if (!normalizedJa.includes(normalizedQuery) && !normalizedEn.includes(normalizedQuery)) {
                    return false;
                }
            }

            // 全ての選択条件を満たしているかを判定
            for (let i = 0; i < activeItems.length; i++) {
                const req = activeItems[i];
                if (req.itemType === 'move') {
                    // 技の判定: learnsetsData[pokemon.id] を参照して技IDが配列内にあるか検証
                    let canLearn = false;
                    if (typeof learnsetsData !== 'undefined' && learnsetsData[p.id]) {
                        canLearn = learnsetsData[p.id].includes(req.id);
                    }
                    // フォルム違いなどで自前のlearnsetsを持たない場合の救済措置 (baseSpecies照会)
                    if (!canLearn && p.baseSpecies) {
                        const baseId = p.baseSpecies.toLowerCase();
                        if (typeof learnsetsData !== 'undefined' && learnsetsData[baseId]) {
                            canLearn = learnsetsData[baseId].includes(req.id);
                        }
                    }
                    if (!canLearn) return false;

                } else if (req.itemType === 'ability') {
                    // 特性の判定: pokemon.abilities 配列に英語特性名 (req.name) があるかを検証
                    if (!p.abilities || !Array.isArray(p.abilities)) return false;
                    if (!p.abilities.includes(req.name)) {
                        return false;
                    }
                }
            }
            // 中央テーブルのタイプアイコンクリックによるタイプ絞り込み条件
            if (selectedTypeFilter) {
                if (!p.types || !p.types.includes(selectedTypeFilter)) {
                    return false;
                }
            }

            // タイプ相性検索による絞り込み
            if (!passesTypeMatchupFilter(p)) {
                return false;
            }

            return true;
        });

        // 該当件数のUI表示更新
        const countLabelEl = document.getElementById('result-count-label');
        if (countLabelEl) {
            if (activeItems.length === 0 && !selectedTypeFilter && !pokemonNameFilter && !excludeMega) {
                countLabelEl.textContent = `全ポケモン表示中(${filteredPokemon.length}体)`;
            } else {
                countLabelEl.textContent = `${filteredPokemon.length}体 該当`;
            }
        }

        // テーブルのソート実行
        if (currentSortField) {
            filteredPokemon = sortPokemonList(filteredPokemon, currentSortField, currentSortOrder);
        }

        // テーブル本体へHTML描画
        renderPokemonTable(filteredPokemon);
    }

    /**
     * 全探索による耐久値(E)の計算関数
     */
    function calculateDurability(stats) {
        if (!stats) return 0;
        const hpReal = (stats.hp || 0) + 75 + 32;
        const b0 = (stats.def || 0) + 20;
        const d0 = (stats.spd || 0) + 20;

        let maxMinStat = 0;
        for (let x = 0; x <= 32; x++) {
            const y = 32 - x;
            const minStat1 = Math.min(Math.floor((b0 + x) * 1.1), d0 + y);
            if (minStat1 > maxMinStat) maxMinStat = minStat1;
            const minStat2 = Math.min(b0 + x, Math.floor((d0 + y) * 1.1));
            if (minStat2 > maxMinStat) maxMinStat = minStat2;
        }
        return Math.floor((hpReal * maxMinStat) / 200);
    }

    /**
     * ポケモン配列の指定プロパティに基づくソート関数
     */
    function sortPokemonList(list, field, order) {
        return list.slice().sort((a, b) => {
            let valA, valB;

            if (field === 'nameJa') {
                valA = a.nameJa || '';
                valB = b.nameJa || '';
                return order === 'asc' ? valA.localeCompare(valB, 'ja') : valB.localeCompare(valA, 'ja');
            } else {
                // 種族値または耐久値(durability)のソート
                if (field === 'durability') {
                    valA = calculateDurability(a.baseStats);
                    valB = calculateDurability(b.baseStats);
                } else {
                    valA = (a.baseStats && a.baseStats[field]) ? a.baseStats[field] : 0;
                    valB = (b.baseStats && b.baseStats[field]) ? b.baseStats[field] : 0;
                }
                return order === 'asc' ? valA - valB : valB - valA;
            }
        });
    }

    /**
     * ポケモンテーブル行のDOM組み立てと描画
     */
    function renderPokemonTable(list) {
        const tbodyEl = document.getElementById('pokemon-table-body');
        if (!tbodyEl) return;

        if (list.length === 0) {
            tbodyEl.innerHTML = `
                <tr class="no-results-row">
                    <td colspan="9">条件に合致します該当するポケモンが見つかりません。別の技または特性をお試しください。</td>
                </tr>
            `;
            return;
        }

        let html = '';
        list.forEach(p => {
            // タイプアイコンSVGの生成
            let typeIconsHtml = '';
            if (p.types && Array.isArray(p.types)) {
                typeIconsHtml = p.types.map(t => {
                    const typeLower = t.toLowerCase();
                    const isFilteredOut = selectedTypeFilter && selectedTypeFilter !== t;
                    const opacityStyle = isFilteredOut ? 'style="opacity: 0.45;"' : '';
                    const activeClass = selectedTypeFilter === t ? 'active-filter' : '';
                    return `<img src="icons/types/${typeLower}.svg" alt="${t}" class="type-icon-img ${activeClass}" title="${t}" data-type="${t}" ${opacityStyle}>`;
                }).join('');
            }

            const stats = p.baseStats || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
            const durability = calculateDurability(stats);
            const hClass = (f) => (currentSortField === f ? 'highlight-stat' : '');

            html += `
                <tr data-id="${p.id}">
                    <td class="col-type"><div class="type-icons-container">${typeIconsHtml}</div></td>
                    <td class="col-name">${p.nameJa || p.name}</td>
                    <td class="col-stat ${hClass('hp')}">${stats.hp}</td>
                    <td class="col-stat ${hClass('atk')}">${stats.atk}</td>
                    <td class="col-stat ${hClass('def')}">${stats.def}</td>
                    <td class="col-stat ${hClass('spa')}">${stats.spa}</td>
                    <td class="col-stat ${hClass('spd')}">${stats.spd}</td>
                    <td class="col-stat ${hClass('spe')}">${stats.spe}</td>
                    <td class="col-stat ${hClass('durability')} font-medium" title="両受け耐久値(E)">${durability}</td>
                </tr>
            `;
        });

        tbodyEl.innerHTML = html;

        // 現在選択されているポケモンがあれば、選択状態の行にクラスを追加
        if (selectedPokemon) {
            const selectedRow = tbodyEl.querySelector(`tr[data-id="${selectedPokemon.id}"]`);
            if (selectedRow) {
                selectedRow.classList.add('selected-row');
            }
        }
    }

    /**
     * ポケモンテーブル内のクリックイベント設定（ポケモン選択 ＆ タイプ絞り込み）
     */
    function setupTableClickEvents() {
        const tbodyEl = document.getElementById('pokemon-table-body');
        if (!tbodyEl) return;

        tbodyEl.addEventListener('click', (e) => {
            // 1. タイプアイコンをクリックした場合（タイプ絞り込み）
            if (e.target.classList.contains('type-icon-img')) {
                e.stopPropagation();
                const clickedType = e.target.getAttribute('data-type');
                if (selectedTypeFilter === clickedType) {
                    selectedTypeFilter = null;
                } else {
                    selectedTypeFilter = clickedType;
                }
                updatePokemonList();
                return;
            }

            // 2. 行（ポケモン）をクリックした場合（詳細表示）
            const tr = e.target.closest('tr');
            if (!tr || tr.classList.contains('no-results-row')) return;

            const pId = tr.getAttribute('data-id');
            const pokemon = pokemonData.find(p => p.id === pId);
            if (pokemon) {
                selectPokemon(pokemon);
            }
        });
    }

    /**
     * ポケモンを選択して詳細欄を更新
     */
    function selectPokemon(pokemon) {
        selectedPokemon = pokemon;

        // テーブル内の選択中行のハイライト表示更新
        const tbodyEl = document.getElementById('pokemon-table-body');
        if (tbodyEl) {
            const rows = tbodyEl.querySelectorAll('tr');
            rows.forEach(r => {
                if (r.getAttribute('data-id') === pokemon.id) {
                    r.classList.add('selected-row');
                } else {
                    r.classList.remove('selected-row');
                }
            });
        }

        renderPokemonDetails();
    }

    /**
     * 防御側のポケモンタイプに対する各攻撃タイプの効果倍率を算出
     */
    function calculateTypeEffectiveness(defendingTypes) {
        const result = { 4: [], 2: [], 0.5: [], 0.25: [], 0: [] };
        if (!defendingTypes || !Array.isArray(defendingTypes)) return result;

        const allTypes = Object.keys(TYPE_CHART);
        allTypes.forEach(atkType => {
            let multiplier = 1;
            defendingTypes.forEach(defType => {
                const chart = TYPE_CHART[atkType];
                if (chart && chart[defType] !== undefined) {
                    multiplier *= chart[defType];
                }
            });
            if (result[multiplier] !== undefined) {
                result[multiplier].push(atkType);
            }
        });
        return result;
    }

    /**
     * 右側：ポケモン詳細情報のレンダリング
     */
    function renderPokemonDetails() {
        const detailContentEl = document.getElementById('detail-content');
        if (!detailContentEl) return;

        if (!selectedPokemon) {
            detailContentEl.innerHTML = `
                <div class="detail-placeholder">
                    <span class="placeholder-icon">🔍</span>
                    <p>中央のリストからポケモンをクリックして詳細情報を表示</p>
                </div>
            `;
            return;
        }

        const p = selectedPokemon;

        // 1. 基本情報のヘッダーカード
        let typeIconsHtml = '';
        if (p.types && Array.isArray(p.types)) {
            typeIconsHtml = p.types.map(t => {
                const typeLower = t.toLowerCase();
                return `<img src="icons/types/${typeLower}.svg" alt="${t}" class="type-icon-img" title="${t}">`;
            }).join(' ');
        }

        let html = `
            <div class="detail-header-card">
                <div class="detail-title-row">
                    <span class="detail-pokemon-name">${p.nameJa}</span>
                    <div class="type-icons-container">${typeIconsHtml}</div>
                </div>
                <div class="detail-pokemon-subname">${p.name} | 重さ: ${p.weightkg}kg</div>
            </div>
        `;

        // 2. 種族値・実数値テーブル
        const stats = p.baseStats || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

        // 各種実数値の計算
        const calcHpNoInvestment = stats.hp + 75;
        const calcHp32Investment = stats.hp + 75 + 32;

        const calcAtkNoInvestment = stats.atk + 20;
        const calcAtk32Investment = stats.atk + 20 + 32;
        const calcAtkSpecialized = Math.floor((stats.atk + 20 + 32) * 1.1);

        const calcDefNoInvestment = stats.def + 20;
        const calcDef32Investment = stats.def + 20 + 32;
        const calcDefSpecialized = Math.floor((stats.def + 20 + 32) * 1.1);

        const calcSpaNoInvestment = stats.spa + 20;
        const calcSpa32Investment = stats.spa + 20 + 32;
        const calcSpaSpecialized = Math.floor((stats.spa + 20 + 32) * 1.1);

        const calcSpdNoInvestment = stats.spd + 20;
        const calcSpd32Investment = stats.spd + 20 + 32;
        const calcSpdSpecialized = Math.floor((stats.spd + 20 + 32) * 1.1);

        const calcSpeNoInvestment = stats.spe + 20;
        const calcSpe32Investment = stats.spe + 20 + 32;
        const calcSpeSpecialized = Math.floor((stats.spe + 20 + 32) * 1.1);

        html += `
            <div class="detail-stats-section">
                <h3>ステータス数値</h3>
                <table class="detail-stats-table">
                    <thead>
                        <tr>
                            <th>能力</th>
                            <th>特化</th>
                            <th>32振り</th>
                            <th>無振り</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="stat-label">HP</td>
                            <td class="stat-val">-</td>
                            <td class="stat-val">${calcHp32Investment}</td>
                            <td class="stat-val">${calcHpNoInvestment}</td>
                        </tr>
                        <tr>
                            <td class="stat-label">攻撃</td>
                            <td class="stat-val">${calcAtkSpecialized}</td>
                            <td class="stat-val">${calcAtk32Investment}</td>
                            <td class="stat-val">${calcAtkNoInvestment}</td>
                        </tr>
                        <tr>
                            <td class="stat-label">防御</td>
                            <td class="stat-val">${calcDefSpecialized}</td>
                            <td class="stat-val">${calcDef32Investment}</td>
                            <td class="stat-val">${calcDefNoInvestment}</td>
                        </tr>
                        <tr>
                            <td class="stat-label">特攻</td>
                            <td class="stat-val">${calcSpaSpecialized}</td>
                            <td class="stat-val">${calcSpa32Investment}</td>
                            <td class="stat-val">${calcSpaNoInvestment}</td>
                        </tr>
                        <tr>
                            <td class="stat-label">特防</td>
                            <td class="stat-val">${calcSpdSpecialized}</td>
                            <td class="stat-val">${calcSpd32Investment}</td>
                            <td class="stat-val">${calcSpdNoInvestment}</td>
                        </tr>
                        <tr>
                            <td class="stat-label">素早</td>
                            <td class="stat-val">${calcSpeSpecialized}</td>
                            <td class="stat-val">${calcSpe32Investment}</td>
                            <td class="stat-val">${calcSpeNoInvestment}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // 2.5 弱点・抵抗力セクション
        const effData = calculateTypeEffectiveness(p.types);
        const effLabels = [
            { mult: 4, label: '4倍', className: 'eff-4x' },
            { mult: 2, label: '2倍', className: 'eff-2x' },
            { mult: 0.5, label: '0.5倍', className: 'eff-05x' },
            { mult: 0.25, label: '0.25倍', className: 'eff-025x' },
            { mult: 0, label: '無効', className: 'eff-0x' }
        ];

        let effRowsHtml = '';
        effLabels.forEach(item => {
            const typesList = effData[item.mult];
            if (typesList && typesList.length > 0) {
                const iconsHtml = typesList.map(typeEng => {
                    const typeLower = typeEng.toLowerCase();
                    let typeJa = typeEng;
                    if (typeof typesData !== 'undefined' && Array.isArray(typesData)) {
                        const tObj = typesData.find(t => t.name === typeEng || t.id === typeLower);
                        if (tObj && tObj.nameJa) typeJa = tObj.nameJa;
                    }
                    return `<img src="icons/types/${typeLower}.svg" alt="${typeJa}" class="type-icon-img eff-icon" title="${typeJa}">`;
                }).join('');

                effRowsHtml += `
                    <div class="eff-row">
                        <span class="eff-badge ${item.className}">${item.label}</span>
                        <div class="eff-icons-group">${iconsHtml}</div>
                    </div>
                `;
            }
        });

        if (!effRowsHtml) {
            effRowsHtml = `<div class="eff-row"><span class="eff-none" style="font-size:12px; color:var(--text-muted);">目立った弱点・抵抗力はありません</span></div>`;
        }

        html += `
            <div class="detail-effectiveness-section">
                <h3>弱点・抵抗力</h3>
                <div class="effectiveness-list">
                    ${effRowsHtml}
                </div>
            </div>
        `;

        // 3. 特性一覧 (abilitiesDataと紐付けて日本語名と効果を表示)
        let abilitiesHtml = '';
        if (p.abilities && Array.isArray(p.abilities)) {
            p.abilities.forEach(abilityEngName => {
                let abilityObj = null;
                if (typeof abilitiesData !== 'undefined' && Array.isArray(abilitiesData)) {
                    abilityObj = abilitiesData.find(a => a.name === abilityEngName);
                }
                const nameJa = abilityObj ? abilityObj.nameJa : abilityEngName;
                const desc = abilityObj ? (abilityObj.desc || abilityObj.shortDesc) : "効果の説明文はありません。";

                // abilitiesHtml += `
                //     <div class="detail-ability-item">
                //         <div class="detail-ability-name">${nameJa} <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">(${abilityEngName})</span></div>
                //         <div class="detail-ability-desc">${desc}</div>
                //     </div>
                // `;
                abilitiesHtml += `
                    <div class="detail-ability-item">
                        <div class="detail-ability-name">${nameJa} <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">(${abilityEngName})</span></div>
                    </div>
                `;
            });
        }

        html += `
            <div class="detail-abilities-section">
                <h3>特性一覧</h3>
                <div class="detail-abilities-list">
                    ${abilitiesHtml || '<div style="font-size: 12.5px; color: var(--text-muted);">特性情報がありません。</div>'}
                </div>
            </div>
        `;

        // 4. 覚える技一覧セクション
        html += `
            <div class="detail-moves-section">
                <h3>覚える技一覧表</h3>
                <div id="detail-moves-container">
                    <!-- renderDetailMovesTable で描画 -->
                </div>
            </div>
        `;

        detailContentEl.innerHTML = html;

        // 技テーブルの描画
        renderDetailMovesTable();
    }

    /**
     * ポケモン詳細内の覚える技一覧テーブルをレンダリング（個別フィルタ状態に対応）
     */
    function renderDetailMovesTable() {
        const container = document.getElementById('detail-moves-container');
        if (!container || !selectedPokemon) return;

        const p = selectedPokemon;

        // このポケモンが覚える技IDの一覧を取得
        let learnableMoveIds = [];
        if (typeof learnsetsData !== 'undefined' && learnsetsData[p.id]) {
            learnableMoveIds = learnsetsData[p.id];
        } else if (p.baseSpecies) {
            const baseId = p.baseSpecies.toLowerCase();
            if (typeof learnsetsData !== 'undefined' && learnsetsData[baseId]) {
                learnableMoveIds = learnsetsData[baseId];
            }
        }

        // movesData から詳細情報を引いてリスト構築
        let pokemonMoves = [];
        if (typeof movesData !== 'undefined' && Array.isArray(movesData)) {
            learnableMoveIds.forEach(moveId => {
                const moveObj = movesData.find(m => m.id === moveId);
                if (moveObj) {
                    pokemonMoves.push(moveObj);
                }
            });
        }

        // デフォルトでタイプ順ソート（ポケモンの持ちタイプが最優先、他タイプはアルファベット順、同タイプ内は技名五十音順）
        const ownTypes = p.types || [];
        pokemonMoves.sort((a, b) => {
            const indexA = ownTypes.indexOf(a.type);
            const indexB = ownTypes.indexOf(b.type);
            const isOwnA = indexA !== -1;
            const isOwnB = indexB !== -1;

            if (isOwnA && !isOwnB) return -1;
            if (!isOwnA && isOwnB) return 1;

            if (isOwnA && isOwnB) {
                if (indexA !== indexB) return indexA - indexB;
            } else {
                const typeCompare = a.type.localeCompare(b.type);
                if (typeCompare !== 0) return typeCompare;
            }
            return a.nameJa.localeCompare(b.nameJa, 'ja');
        });

        // タイプ・分類・優先度フィルタの適用
        if (moveTypeFilter) {
            pokemonMoves = pokemonMoves.filter(m => m.type === moveTypeFilter);
        }
        if (moveCategoryFilter) {
            pokemonMoves = pokemonMoves.filter(m => m.category === moveCategoryFilter);
        }
        if (movePriorityFilter !== null) {
            pokemonMoves = pokemonMoves.filter(m => (m.priority !== undefined ? m.priority : 0) === Number(movePriorityFilter));
        }

        // フィルタバーのHTML
        let filterBarHtml = '';
        if (moveTypeFilter || moveCategoryFilter || movePriorityFilter !== null) {
            filterBarHtml = `<div class="moves-filter-bar">フィルター適用中: `;
            if (moveTypeFilter) {
                filterBarHtml += `
                    <span class="moves-filter-chip">
                        タイプ: ${moveTypeFilter}
                        <span class="clear-chip" id="clear-move-type-filter">✕</span>
                    </span>`;
            }
            if (moveCategoryFilter) {
                const categoryJaName = moveCategoryFilter === 'Physical' ? '物理' : (moveCategoryFilter === 'Special' ? '特殊' : '変化');
                filterBarHtml += `
                    <span class="moves-filter-chip">
                        分類: ${categoryJaName}
                        <span class="clear-chip" id="clear-move-cat-filter">✕</span>
                    </span>`;
            }
            if (movePriorityFilter !== null) {
                const pVal = Number(movePriorityFilter);
                const priorityDisplay = pVal !== 0 ? (pVal > 0 ? `+${pVal}` : `${pVal}`) : '±0';
                filterBarHtml += `
                    <span class="moves-filter-chip">
                        優先度: ${priorityDisplay}
                        <span class="clear-chip" id="clear-move-priority-filter">✕</span>
                    </span>`;
            }
            filterBarHtml += `</div>`;
        }

        // 技一覧テーブルの組み立て
        let tableRowsHtml = '';
        if (pokemonMoves.length === 0) {
            tableRowsHtml = `
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--text-dim); padding: 30px 10px;">
                        条件に合致する技がありません。
                    </td>
                </tr>
            `;
        } else {
            pokemonMoves.forEach(m => {
                const typeLower = m.type.toLowerCase();

                // 分類表示用
                const catJa = m.category === 'Physical' ? '物理' : (m.category === 'Special' ? '特殊' : '変化');

                // 威力・命中・優先度
                const powerText = m.category === 'Status' ? '-' : (m.basePower !== undefined ? m.basePower : '0');
                const accText = m.accuracy === true ? '必中' : (m.accuracy || '-');
                const priorityVal = m.priority !== undefined ? m.priority : 0;
                const priorityText = priorityVal !== 0 ? (priorityVal > 0 ? `+${priorityVal}` : `${priorityVal}`) : '-';

                tableRowsHtml += `
                    <tr class="move-row" data-move-id="${m.id}">
                        <td><span class="move-category-badge category-${m.category}" data-category="${m.category}">${catJa}</span></td>
                        <td><img src="icons/types/${typeLower}.svg" alt="${m.type}" class="type-icon-img" title="${m.type}" data-type="${m.type}"></td>
                        <td style="font-weight: 700;">${m.nameJa}</td>
                        <td>${powerText}</td>
                        <td>${accText}</td>
                        <td><span class="move-priority-badge" data-priority="${priorityVal}" title="クリックで優先度フィルタ">${priorityText}</span></td>
                    </tr>
                `;
            });
        }

        const tableHtml = `
            ${filterBarHtml}
            <div class="detail-moves-table-container">
                <table class="detail-moves-table">
                    <thead>
                        <tr>
                            <th>分類</th>
                            <th>タイプ</th>
                            <th>技名</th>
                            <th>威力</th>
                            <th>命中</th>
                            <th>優先</th>
                        </tr>
                    </thead>
                    <tbody id="detail-moves-tbody">
                        ${tableRowsHtml}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHtml;

        // イベントリスナーの付与
        setupMovesTableEvents();
    }

    /**
     * ポケモン詳細内の技テーブルに対するイベントを設定（フィルタ＆詳細開閉）
     */
    function setupMovesTableEvents() {
        // 1. フィルターチップ解除のリスナー
        const clearTypeBtn = document.getElementById('clear-move-type-filter');
        if (clearTypeBtn) {
            clearTypeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                moveTypeFilter = null;
                renderDetailMovesTable();
            });
        }

        const clearCatBtn = document.getElementById('clear-move-cat-filter');
        if (clearCatBtn) {
            clearCatBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                moveCategoryFilter = null;
                renderDetailMovesTable();
            });
        }

        const clearPriorityBtn = document.getElementById('clear-move-priority-filter');
        if (clearPriorityBtn) {
            clearPriorityBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                movePriorityFilter = null;
                renderDetailMovesTable();
            });
        }

        const tbody = document.getElementById('detail-moves-tbody');
        if (!tbody) return;

        tbody.addEventListener('click', (e) => {
            // 2. タイプアイコンクリックによるタイプ絞り込み
            if (e.target.classList.contains('type-icon-img')) {
                e.stopPropagation();
                const clickedType = e.target.getAttribute('data-type');
                if (moveTypeFilter === clickedType) {
                    moveTypeFilter = null;
                } else {
                    moveTypeFilter = clickedType;
                }
                renderDetailMovesTable();
                return;
            }

            // 3. 分類バッジクリックによる分類絞り込み
            if (e.target.classList.contains('move-category-badge')) {
                e.stopPropagation();
                const clickedCat = e.target.getAttribute('data-category');
                if (moveCategoryFilter === clickedCat) {
                    moveCategoryFilter = null;
                } else {
                    moveCategoryFilter = clickedCat;
                }
                renderDetailMovesTable();
                return;
            }

            // 4. 優先度バッジクリックによる優先度絞り込み
            if (e.target.classList.contains('move-priority-badge')) {
                e.stopPropagation();
                const clickedPriority = Number(e.target.getAttribute('data-priority'));
                if (movePriorityFilter !== null && Number(movePriorityFilter) === clickedPriority) {
                    movePriorityFilter = null;
                } else {
                    movePriorityFilter = clickedPriority;
                }
                renderDetailMovesTable();
                return;
            }
        });
    }

    /**
     * テーブルヘッダーのクリックによるソートの初期化と制御
     */
    function setupTableSortEvents() {
        const headers = [
            { id: 'th-name', field: 'nameJa', defaultOrder: 'asc' },
            { id: 'th-hp', field: 'hp', defaultOrder: 'desc' },
            { id: 'th-atk', field: 'atk', defaultOrder: 'desc' },
            { id: 'th-def', field: 'def', defaultOrder: 'desc' },
            { id: 'th-spa', field: 'spa', defaultOrder: 'desc' },
            { id: 'th-spd', field: 'spd', defaultOrder: 'desc' },
            { id: 'th-spe', field: 'spe', defaultOrder: 'desc' },
            { id: 'th-durability', field: 'durability', defaultOrder: 'desc' }
        ];

        headers.forEach(h => {
            const th = document.getElementById(h.id);
            if (!th) return;

            th.addEventListener('click', () => {
                if (currentSortField === h.field) {
                    // 同じカラムを押した場合は順序反転
                    currentSortOrder = (currentSortOrder === 'asc') ? 'desc' : 'asc';
                } else {
                    // 別のカラムを選んだ際はそのカラムの推奨デフォルト方向にする
                    currentSortField = h.field;
                    currentSortOrder = h.defaultOrder;
                }

                updateSortIndicators(headers);
                updatePokemonList();
            });

            // キーボードアクセシビリティ
            th.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    th.click();
                }
            });
        });
    }

    /**
     * ヘッダーのソート矢印記号表示の更新
     */
    function updateSortIndicators(headers) {
        headers.forEach(h => {
            const th = document.getElementById(h.id);
            if (!th) return;
            const arrowSpan = th.querySelector('.sort-arrow');
            if (!arrowSpan) return;

            if (currentSortField === h.field) {
                arrowSpan.textContent = (currentSortOrder === 'asc') ? '▲' : '▼';
            } else {
                arrowSpan.textContent = '';
            }
        });
    }

    // ページDOMロード完了時に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
