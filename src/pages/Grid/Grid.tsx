// @ts-nocheck
import { useEffect, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeGrid } from 'react-window';
import './test.css';
import useKeyPress from './useKeyPress';

const initialEditingCell = { rowIndex: -1, columnIndex: -1, value: '' };

export default function Grid() {
  const [isDragging, setIsDragging] = useState(false);
  const [selection, setSelection] = useState({
    rowStartIndex: -1,
    rowStopIndex: -1,
    columnStartIndex: -1,
    columnStopIndex: -1,
  });
  const [gridData, setGridData] = useState({
    // rowIndex: { columnIndex: { value: '' } },
  });
  const [editingCell, setEdittingCell] = useState(initialEditingCell);

  const { rowStartIndex, rowStopIndex, columnStartIndex, columnStopIndex } =
    selection;
  const isEditting =
    editingCell.rowIndex !== initialEditingCell.rowIndex &&
    editingCell.columnIndex !== initialEditingCell.columnIndex;

  const handleEnter = () => {
    if (isEditting) return;
    setEdittingCell({
      rowIndex: rowStartIndex,
      columnIndex: columnStartIndex,
      value: gridData?.[rowStartIndex]?.[columnStartIndex]?.value,
    });
  };

  const handleDelete = () => {
    if (isEditting) return;
    console.log('Delete');
    let newGridData = { ...gridData };
    const rowIndices = [
      ...Array(Math.abs(rowStopIndex - rowStartIndex) + 1),
    ].map((_, i) => i + Math.min(rowStartIndex, rowStopIndex));
    const columnIndices = [
      ...Array(Math.abs(columnStopIndex - columnStartIndex) + 1),
    ].map((_, i) => i + Math.min(columnStartIndex, columnStopIndex));

    rowIndices.forEach((rowIndex) => {
      if (!newGridData[rowIndex]) return;
      columnIndices.forEach((columnIndex) => {
        if (!newGridData[rowIndex][columnIndex]) return;
        delete newGridData[rowIndex][columnIndex].value;
      });
    });
    setGridData(newGridData);
  };

  const handleMouseDown = ({ rowIndex, columnIndex }, e) => {
    setIsDragging(true);
    if (e.shiftKey) {
      setSelection((selection) => ({
        ...selection,
        rowStopIndex: rowIndex,
        columnStopIndex: columnIndex,
      }));
      return;
    }
    setSelection({
      rowStartIndex: rowIndex,
      columnStartIndex: columnIndex,
      rowStopIndex: rowIndex,
      columnStopIndex: columnIndex,
    });
  };

  const handleMouseOver = ({ rowIndex, columnIndex }) => {
    if (!isDragging) return;
    setSelection((selection) => ({
      ...selection,
      rowStopIndex: rowIndex,
      columnStopIndex: columnIndex,
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleUpdateGridData = ({ rowIndex, columnIndex }, e) => {
    setEdittingCell(initialEditingCell);
    if (
      e.target.value === '' &&
      gridData?.[rowIndex]?.[columnIndex]?.value === undefined
    )
      return;
    setGridData((gridData) => ({
      ...gridData,
      [rowIndex]: {
        ...gridData?.[rowIndex],
        [columnIndex]: {
          ...gridData?.[rowIndex]?.[columnIndex],
          value: editingCell.value,
        },
      },
    }));
  };

  const handleDoubleClick = ({ rowIndex, columnIndex }) => {
    setEdittingCell({
      ...editingCell,
      rowIndex,
      columnIndex,
      value: gridData?.[rowIndex]?.[columnIndex]?.value,
    });
  };

  const handleChangeEditingCell = (e) => {
    setEdittingCell({ ...editingCell, value: e.target.value });
  };

  const handleKeyDownInput = ({ rowIndex, columnIndex }, e) => {
    if (e.key === 'Enter') handleUpdateGridData({ rowIndex, columnIndex }, e);
  };

  const handleMoveUp = (e) => {
    e.preventDefault();
    if (isEditting) return;
    setSelection((selection) => ({
      ...selection,
      rowStartIndex: selection.rowStartIndex - 1,
      rowStopIndex: selection.rowStartIndex - 1,
      columnStopIndex: selection.columnStartIndex,
    }));
  };

  const handleMoveDown = (e) => {
    e.preventDefault();
    if (isEditting) return;
    setSelection((selection) => ({
      ...selection,
      rowStartIndex: selection.rowStartIndex + 1,
      rowStopIndex: selection.rowStartIndex + 1,
      columnStopIndex: selection.columnStartIndex,
    }));
  };

  const handleMoveLeft = (e) => {
    e.preventDefault();
    if (isEditting) return;
    setSelection((selection) => ({
      ...selection,
      columnStartIndex: selection.columnStartIndex - 1,
      columnStopIndex: selection.columnStartIndex - 1,
      rowStopIndex: selection.rowStartIndex,
    }));
  };

  const handleMoveRight = (e) => {
    e.preventDefault();
    if (isEditting) return;
    setSelection((selection) => ({
      ...selection,
      columnStartIndex: selection.columnStartIndex + 1,
      columnStopIndex: selection.columnStartIndex + 1,
      rowStopIndex: selection.rowStartIndex,
    }));
  };

  useKeyPress(['Delete'], handleDelete);
  useKeyPress(['Backspace'], handleDelete);
  useKeyPress(['Enter'], handleEnter);
  useKeyPress(['ArrowUp'], handleMoveUp);
  useKeyPress(['ArrowDown'], handleMoveDown);
  useKeyPress(['ArrowLeft'], handleMoveLeft);
  useKeyPress(['ArrowRight'], handleMoveRight);

  useEffect(() => {
    const handleCopy = async () => {
      console.log('Copy');
      const rowIndices = [
        ...Array(Math.abs(rowStopIndex - rowStartIndex) + 1),
      ].map((_, i) => i + Math.min(rowStartIndex, rowStopIndex));
      const columnIndices = [
        ...Array(Math.abs(columnStopIndex - columnStartIndex) + 1),
      ].map((_, i) => i + Math.min(columnStartIndex, columnStopIndex));
      let text = '';

      rowIndices.forEach((rowIndex, rIndex) => {
        if (rIndex > 0) text += '\n';
        columnIndices.forEach((columnIndex, cIndex) => {
          const value = gridData?.[rowIndex]?.[columnIndex]?.value || '';
          if (cIndex > 0) text += `\t`;
          text += value;
        });
      });
      await navigator.clipboard.writeText(text);
    };

    window.addEventListener('copy', handleCopy);
    return () => {
      window.removeEventListener('copy', handleCopy);
    };
  }, [
    columnStartIndex,
    columnStopIndex,
    gridData,
    rowStartIndex,
    rowStopIndex,
  ]);

  useEffect(() => {
    const handlePaste = async () => {
      console.log('Paste');
      let newGridData = { ...gridData };
      const text = await navigator.clipboard.readText();

      text.split('\n').forEach((rowText, rIndex) => {
        const rowIndex = rIndex + rowStartIndex;
        if (!newGridData[rowIndex]) newGridData[rowIndex] = {};
        rowText.split('\t').forEach((value, cIndex) => {
          const columnIndex = cIndex + columnStartIndex;
          if (!newGridData[rowIndex][columnIndex]) {
            newGridData[rowIndex][columnIndex] = {};
          }
          newGridData[rowIndex][columnIndex].value = value;
        });
      });
      setGridData(newGridData);
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [columnStartIndex, gridData, rowStartIndex]);

  return (
    <AutoSizer>
      {({ height, width }) => (
        <VariableSizeGrid
          columnCount={1000}
          columnWidth={(index) => (index % 2 ? 100 : 80)}
          height={height}
          rowCount={1000000}
          rowHeight={(index) => (index % 2 ? 40 : 30)}
          width={width}
          itemData={{
            selection,
            setSelection,
            isDragging,
            setIsDragging,
            gridData,
            setGridData,
            editingCell,
            setEdittingCell,
            onMouseDown: handleMouseDown,
            onMouseOver: handleMouseOver,
            onMouseUp: handleMouseUp,
            onBlur: handleUpdateGridData,
            onDoubleClick: handleDoubleClick,
            onChangeEditingCell: handleChangeEditingCell,
            onKeyUp: handleKeyDownInput,
          }}
        >
          {Cell}
        </VariableSizeGrid>
      )}
    </AutoSizer>
  );
}

function Cell({ columnIndex, rowIndex, style, data }) {
  const {
    selection,
    gridData,
    editingCell,
    onMouseDown,
    onMouseOver,
    onMouseUp,
    onBlur,
    onDoubleClick,
    onChangeEditingCell,
    onKeyUp,
  } = data;

  const { rowStartIndex, columnStartIndex, rowStopIndex, columnStopIndex } =
    selection;

  const isInsideSelection =
    columnIndex >= Math.min(columnStartIndex, columnStopIndex) &&
    columnIndex <= Math.max(columnStartIndex, columnStopIndex) &&
    rowIndex >= Math.min(rowStartIndex, rowStopIndex) &&
    rowIndex <= Math.max(rowStartIndex, rowStopIndex);

  const isStartCell =
    rowStartIndex === rowIndex && columnStartIndex === columnIndex;

  const isEditting =
    editingCell.rowIndex === rowIndex &&
    editingCell.columnIndex === columnIndex;

  if (isEditting) {
    return (
      <input
        type="text"
        style={{
          ...style,
          padding: '0 5px',
          border: '1px solid black',
          outline: 'none',
          lineHeight: '40px',
        }}
        value={editingCell.value || ''}
        onChange={(e) => onChangeEditingCell(e)}
        onBlur={(e) => onBlur({ rowIndex, columnIndex }, e)}
        onKeyUp={(e) => onKeyUp({ rowIndex, columnIndex }, e)}
        autoFocus
      />
    );
  }

  return (
    <span
      className={`${isInsideSelection ? 'selected-range' : ''} ${
        isStartCell ? 'selected-cell' : ''
      }`}
      onMouseDown={(e) => onMouseDown({ rowIndex, columnIndex }, e)}
      onMouseOver={() => onMouseOver({ rowIndex, columnIndex })}
      onMouseUp={onMouseUp}
      onDoubleClick={() => onDoubleClick({ rowIndex, columnIndex })}
      style={{
        ...style,
        padding: '0 5px',
        lineHeight: '40px',
        border: '1px solid black',
        userSelect: 'none',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {gridData?.[rowIndex]?.[columnIndex]?.value}
    </span>
  );
}
