import { NextRequest, NextResponse } from 'next/server';
import { getAllTables, rollOnTable, getRandomName, getRandomTavernName } from '@/lib/random-tables';

export async function GET(request: NextRequest) {
  try {
    // Возвращаем список всех доступных таблиц
    const tables = getAllTables();
    
    return NextResponse.json({
      success: true,
      tables: tables.map((t) => ({
        id: t.id,
        category: t.category,
        name: t.name,
        description: t.description,
        diceFormula: t.diceFormula,
        entryCount: t.entries.length,
      })),
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, action } = body;

    // Быстрая генерация имени
    if (action === 'random_name') {
      const { nameType } = body;
      const name = getRandomName(nameType || 'human_male');
      return NextResponse.json({
        success: true,
        type: 'name',
        result: name,
      });
    }

    // Быстрая генерация названия таверны
    if (action === 'random_tavern') {
      const name = getRandomTavernName();
      return NextResponse.json({
        success: true,
        type: 'tavern',
        result: name,
      });
    }

    // Бросок по таблице
    if (!tableId) {
      return NextResponse.json({ error: 'Missing tableId' }, { status: 400 });
    }

    const tables = getAllTables();
    const table = tables.find((t) => t.id === tableId);

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Бросаем кубик
    const result = rollOnTable(table);

    return NextResponse.json({
      success: true,
      table: {
        id: table.id,
        name: table.name,
        diceFormula: table.diceFormula,
      },
      roll: result.actualRoll,
      result: {
        text: result.result,
        details: result.details,
      },
    });
  } catch (error) {
    console.error('Error rolling on table:', error);
    return NextResponse.json(
      { error: 'Failed to roll on table' },
      { status: 500 }
    );
  }
}

