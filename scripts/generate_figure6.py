#!/usr/bin/env python3
"""
Generate Figure 6 visualization for Assumption-Gated BioDesign Runtime artifact
Reads results/figure6_data.csv and generates figures/figure6.png and figures/figure6.pdf
"""

import csv
import json
import os
import sys
from pathlib import Path

try:
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    import numpy as np
except ImportError:
    print("Error: matplotlib and numpy are required. Install with: pip install matplotlib numpy")
    sys.exit(1)


def load_figure6_data(csv_path: str) -> dict:
    """Load figure 6 data from CSV file."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Figure 6 data not found: {csv_path}")
    
    data = {
        'mismatches': [],
        'matches': [],
        'by_surface': {},
        'by_status': {},
    }
    
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            matches = row.get('matches', 'false').lower() == 'true'
            surface = row['surface']
            expected_status = row['expectedStatus']
            actual_status = row['actualStatus']
            
            entry = {
                'caseId': row['caseId'],
                'category': row['category'],
                'toolId': row['toolId'],
                'surface': surface,
                'expectedStatus': expected_status,
                'actualStatus': actual_status,
                'expectedBlockCode': row.get('expectedBlockCode') or None,
                'actualBlockCode': row.get('actualBlockCode') or None,
                'matches': matches,
            }
            
            if matches:
                data['matches'].append(entry)
            else:
                data['mismatches'].append(entry)
            
            # Aggregate by surface
            if surface not in data['by_surface']:
                data['by_surface'][surface] = {'total': 0, 'mismatches': 0}
            data['by_surface'][surface]['total'] += 1
            if not matches:
                data['by_surface'][surface]['mismatches'] += 1
            
            # Aggregate by expected status
            key = f"{expected_status}->{actual_status}"
            if key not in data['by_status']:
                data['by_status'][key] = 0
            if not matches:
                data['by_status'][key] += 1
    
    return data


def generate_figure6(data: dict, output_dir: str) -> None:
    """Generate Figure 6 visualization."""
    os.makedirs(output_dir, exist_ok=True)
    
    # Create a figure with multiple subplots
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle('Assumption-Gated BioDesign Runtime - Trust Policy Evaluation Results', fontsize=16, fontweight='bold')
    
    # Plot 1: Mismatches by surface
    surfaces = sorted(data['by_surface'].keys())
    mismatch_counts = [data['by_surface'][s]['mismatches'] for s in surfaces]
    total_counts = [data['by_surface'][s]['total'] for s in surfaces]
    correct_counts = [total_counts[i] - mismatch_counts[i] for i in range(len(surfaces))]
    
    x = np.arange(len(surfaces))
    width = 0.35
    
    ax1.bar(x - width/2, correct_counts, width, label='Correct', color='#2ecc71')
    ax1.bar(x + width/2, mismatch_counts, width, label='Mismatch', color='#e74c3c')
    ax1.set_xlabel('Claim Surface')
    ax1.set_ylabel('Number of Cases')
    ax1.set_title('Evaluation Accuracy by Claim Surface')
    ax1.set_xticks(x)
    ax1.set_xticklabels(surfaces, rotation=45, ha='right')
    ax1.legend()
    ax1.grid(axis='y', alpha=0.3)
    
    # Plot 2: Overall statistics pie chart
    total_cases = len(data['matches']) + len(data['mismatches'])
    match_pct = len(data['matches']) / total_cases * 100
    mismatch_pct = len(data['mismatches']) / total_cases * 100
    
    colors = ['#2ecc71', '#e74c3c']
    ax2.pie([len(data['matches']), len(data['mismatches'])], 
            labels=[f'Correct\n({len(data["matches"])} cases)', f'Mismatch\n({len(data["mismatches"])} cases)'],
            colors=colors,
            autopct='%1.1f%%',
            startangle=90)
    ax2.set_title(f'Overall Accuracy: {match_pct:.1f}%')
    
    # Plot 3: Status transitions for mismatches
    status_pairs = sorted(data['by_status'].keys())
    mismatch_counts_by_status = [data['by_status'][pair] for pair in status_pairs]
    
    if status_pairs:
        ax3.barh(range(len(status_pairs)), mismatch_counts_by_status, color='#e74c3c')
        ax3.set_yticks(range(len(status_pairs)))
        ax3.set_yticklabels(status_pairs)
        ax3.set_xlabel('Number of Mismatches')
        ax3.set_title('Mismatch Distribution by Status Transitions')
        ax3.grid(axis='x', alpha=0.3)
    
    # Plot 4: Summary statistics text
    ax4.axis('off')
    summary_text = f"""
    Benchmark Summary

    Total Cases: {total_cases}
    Correct: {len(data['matches'])} ({match_pct:.1f}%)
    Mismatches: {len(data['mismatches'])} ({mismatch_pct:.1f}%)
    
    Mismatch Breakdown by Surface:
    """
    
    for surface in surfaces:
        count = data['by_surface'][surface]['mismatches']
        summary_text += f"\n    {surface}: {count}"
    
    summary_text += "\n\nNote: This is a representative artifact benchmark.\nIt does not constitute third-party validation or regulatory certification."
    
    ax4.text(0.1, 0.5, summary_text, fontsize=11, verticalalignment='center',
             family='monospace', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    # Save as PNG
    png_path = os.path.join(output_dir, 'figure6.png')
    plt.savefig(png_path, dpi=150, bbox_inches='tight')
    print(f"✓ Figure 6 PNG saved: {png_path}")
    
    # Save as PDF
    pdf_path = os.path.join(output_dir, 'figure6.pdf')
    plt.savefig(pdf_path, bbox_inches='tight')
    print(f"✓ Figure 6 PDF saved: {pdf_path}")
    
    plt.close()


def main():
    """Main entry point."""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    csv_path = project_root / 'results' / 'figure6_data.csv'
    output_dir = project_root / 'figures'
    
    try:
        print("Loading figure 6 data...")
        data = load_figure6_data(str(csv_path))
        print(f"  Loaded {len(data['matches']) + len(data['mismatches'])} test cases")
        
        print("Generating Figure 6 visualization...")
        generate_figure6(data, str(output_dir))
        
        print("\n✓ Figure 6 generation complete!")
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
